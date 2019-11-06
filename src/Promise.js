const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
const isFunc = params => typeof params === 'function'

class Promise {
    constructor(executor) {
        if (!isFunc(executor)) throw new Error('Promise only accept a function as a parameter')

        // 状态
        this._status = PENDING
        // 数据
        this._value = undefined
        // 成功回调队列
        this._fulfillQueues = []
        // 失败回调队列
        this._rejectQueues = []

        try {
            executor(this._resolve.bind(this), this._reject.bind(this))
        } catch (error) {
            this._reject(error)
        }
    }
    // resolve时候执行的函数
    _resolve(value) {
        if (this._status === PENDING) {
            this._status = FULFILLED
            this._value = value
            // 2.2.2.3 回调函数只能调用一次
            let cb = this._fulfillQueues.shift()
            while(cb) {
                cb(value)
                cb = this._fulfillQueues.shift()
            }
            // 队列被清空
        }
    }
    // reject时候执行的函数
    _reject(reason) {
        if (this._status === PENDING) {
            this._status = REJECTED
            this._value = reason
            // 2.2.3.3 回调函数只能调用一次
            let cb = this._rejectQueues.shift()
            while(cb) {
                cb(reason)
                cb = this._rejectQueues.shift()
            }
            // 队列被清空
        }
    }
    // then
    then(onFulfilled, onRejected) {
        // 2.2.1 onFulfilled， onRejected 都是可选的
        // 2.2.5 onFulfilled， onRejected 必须作为函数调用
        
        // 2.2.7.3 若 onFulfilled ，不是一个函数，当前promise1为完成状态，
        // 那promise2也是完成状态，且值promise1的 value
        // 2.2.7.3 若 onRejected ，不是一个函数，当前promise1为失败状态，
        // 那promise2也是失败状态，且值为promise1的 reason
        onFulfilled = isFunc(onFulfilled) ? onFulfilled : value => value
        onRejected = isFunc(onRejected) ? onRejected : reason => { throw reason }
        const context = this

        // 2.2.7 then必须返回一个promise
        const promise2 = new Promise(function(resolve, reject){
            if (context._status === FULFILLED) {
                // 2.2.2 如果 onFulfilled 是函数,必须在promise1 fulfilled之后调用，其参数为promise1的value
                // 2.2.4 onFulfilled，必须异步的调用
                // 3.1 可以使用微任务 MutationObserver 或者 process.nextTick. 或者使用宏任务 setTimeout , setImmediate.
                setTimeout(() => {
                    try {
                        // 2.2.7.1 如果 onFulfilled， onRejected 返回了值 x ，运行 
                        // the Promise Resolution Procedure [[Resolve]](promise2, x)
                        let x = onFulfilled(context._value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (error) {
                        // 2.2.7.2 如果 onFulfilled， onRejected 抛出了错误，那 promise2 就 reject(error)
                        reject(error)
                    }
                })
                return
            }
            if (context._status === REJECTED) {
                // 2.2.3 如果 onRejected 是函数,必须在promise1 rejected 之后调用，其参数为promise1的value
                // 2.2.4 onRejected ，必须异步的调用
                // 3.1 可以使用微任务 MutationObserver 或者 process.nextTick. 或者使用宏任务 setTimeout , setImmediate.
                setTimeout(() => {
                    try {
                        // 2.2.7.1 如果 onFulfilled， onRejected 返回了值 x ，运行 
                        // the Promise Resolution Procedure [[Resolve]](promise2, x)
                        let x = onRejected(context._value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (error) {
                        // 2.2.7.2 如果 onFulfilled， onRejected 抛出了错误，那 promise2 就 reject(error)
                        reject(error)
                    }
                })
                return
            }
            if (context._status === PENDING) {
                context._fulfillQueues.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(context._value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
                context._rejectQueues.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(context._value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
            }
        })
        return promise2
    }
    // 用于测试
    // defer
    static defer() {
        return defer()
    }
    static deferred() {
        return defer()
    }
    // promise 规范只要求我们必须实现 then  方法，但是es6规范还要求一些静态方法与实例方法，如
    // 静态方法：Promise.resolve, Promise.reject, Promise.all, Promise.race
    // 实例方法：catch, finally
    // 在ES6标准入门中还有 done 方法，面试题中还有要实现 retry 方法
    // catch
    catch(onRejected) {
        return this.then(undefined, onRejected)
    }
    // done
    // 总是处于回调链的尾端，保证抛出任何可能的错误
    done(onFulfilled, onRejected) {
        this.then(onFulfilled, onRejected)
            .catch(reason => {
                // 全局抛出一个错误
                setTimeout(() => { throw reason }, 0)
            })
    }
    // finally
    // 和 done 的最大区别是，接受一个普通的回调函数作为参数，该函数不管怎样都会执行
    finally(handle) {
        return this.then(
            value => Promise.resolve(handle()).then(() => value),
            reason => Promise.resolve(handle()).then(() => { throw reason })
        )
    }
    // staic resolve
    static resolve(value) {
        if(value instanceof Promise) return value
        return new Promise(resolve => resolve(value))
    }
    // static reject
    static reject(reason) {
        return new Promise((resolve, reject) => reject(reason))
    }
    // parameter #1, the function to return a Promise
    // parameter #2, the max retry times
    // parameter #3, the delay between each attempt
    static retry(fn, times, delay) {
        return new Promise((resolve, reject) => {
            function attempt() {
                fn().then(resolve)
                    .catch(err => {
                        if (times === 0) {
                            reject(err)
                        } else {
                            times--
                            setTimeout(() => {
                                attempt()
                            }, delay)
                        }
                    })
            }
            attempt()
        })
    }
    // static all
    all(promises) {
        return new Promise((resolve, reject) => {
            let count = 0
            let results = []
            let len = promises.length
            if (!promises.length) {
                // 空的可迭代对象,直接返回
                resolve(results)
            } else {
                for(let i = 0; i < len; i++) {
                    Promise.resolve(promises[i]).then(
                        value => {
                            results[i] = value
                            count++
                            // 所有promise都完成后， resolve
                            if(count === len) resolve(results)
                        },
                        // 有一个发生错误，直接reject
                        error => reject(error)
                    )
                }
            }
        })
    }
    // static race
    race(promises) {
        return new Promise((resolve, reject) => {
            for(let p of promises) {
                // 第一个 Promise 完成或者失败后，直接返回结果
                Promise.resolve(p).then(
                    value => resolve(value),
                    reason => reject(reason)
                )
            }
        })
    }
}
function resolvePromise(promise2, x, resolve, reject) {
    // 2.3.1 如果promise2和x是同一个对象，使用一个 TypeError 来 reject promise
    if (promise2 === x) {
        reject(new TypeError('Chaining cycle'))
    }
    if (x && typeof x === 'object' || isFunc(x)) {
        // 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 都被调用了，或者
        // 相同的参数被多次调用了，那么只取第一次调用，后面的调用忽略掉
        let used;
        try {
            // 2.3.3.1 把 x.then 赋值给 then
            const then = x.then
            // 2.3.3.3 如果then是一个函数，调用它，把x作为this，
            // resolvePromise 作为第一个参数，rejectPromise 作为第二个参数
            if (isFunc(then)) {
                then.call(
                    x,
                    // 2.3.3.3.1 如果/当使用值y来调用resolvePromise时候，运行
                    // resolvePromise(promise2, y, resolve, reject)
                    y => {
                        if(used) return
                        used = true
                        resolvePromise(promise2, y, resolve, reject)
                    },
                    // 2.3.3.3.2 如果/当使用值r来调用 作为第一个参数，rejectPromise 时候，使用
                    // 值 r 来 reject promise
                    r => {
                        if(used) return
                        used = true
                        reject(r)
                    }
                )
            } else {
                // 2.3.3.4 如果 then 不是函数，使用 x 来 fulfill promsie
                if(used) return
                used = true
                resolve(x)
            }
        } catch (error) {
            // 2.3.3.2 如果 2.3.3.1发生了错误，使用error来reject promise
            if(used) return
            used = true
            reject(error)
        }
    } else {
        // 2.3.4 如果 x 不是对象或函数, 使用 x 来 fulfill promsie
        resolve(x)
    }
}
function defer() {
    const dfd = {}
    dfd.promise = new Promise((resolve, reject) => {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}
module.exports = Promise
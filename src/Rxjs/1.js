import { from, zip } from 'rxjs';
import { concatMap } from 'rxjs/operators';

const makePromise = (name, delay) => new Promise((resolve, reject) => setTimeout(() => resolve(`${name} done`), delay));

const uploadImgs$ = from(makePromise('uploadImgs', 1000));
const uploadFiles$ = from(makePromise('uploadFiles', 2000));
const submitForm$ = from(makePromise('submitForm', 1000));

const subInst = zip(
    uploadImgs$,
    uploadFiles$
).pipe(
    concatMap(val => {
        console.log('val', val);
        return submitForm$
    })
).subscribe(
    data => {
        console.log('data', data)
    },
    error => {
        console.log('error', error)
    }
);

// async await实现
async function submitForm () {
    const val = await Promise.all([
        makePromise('uploadImgs', 1000),
        makePromise('uploadFiles', 2000)
    ]);
    console.log('val', val);
    const val2 = await makePromise('submitForm', 1000);
    console.log('val2', val2);
}
submitForm()
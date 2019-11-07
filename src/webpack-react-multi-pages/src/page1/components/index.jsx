import { hot } from 'react-hot-loader/root'
import Hello from '@/components/hello'

function Index() {
    return (
        <div>
            <Hello value="page1" />
            <a href="./page2.html">page2</a>
        </div>
    )
}
export default hot(Index)
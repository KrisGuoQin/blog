import { hot } from 'react-hot-loader/root'
import Hello from '@/components/hello'

function Index() {
    return (
        <div>
            <Hello value="page2" />
            <a href="./page1.html">page1</a>
        </div>
    )
}
export default hot(Index)
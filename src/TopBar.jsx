
import './TopBar.css'
import { Link } from 'react-router-dom';


function TopBar() {

    return (
        <>
            <div className='topBar'>
                <Link to="/" className='title'>Book Site</Link>
            </div>
        </>
    )
}

export default TopBar
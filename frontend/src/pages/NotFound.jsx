import {useNavigate} from "react-router-dom";
import '../styles/notFound.css'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="not-found-page">
            <h1>404 - Page Not Found</h1>
            <p>Press the button below to go back</p>
            <button className='back-btn'
                onClick={() => navigate('/')}
            >
                Back to Home Page!
            </button>
        </div>

    )
}


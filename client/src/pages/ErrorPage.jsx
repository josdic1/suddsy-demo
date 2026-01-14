import { useRouteError, useNavigate } from "react-router-dom";


export function ErrorPage() {
    const navigate = useNavigate();
    const error = useRouteError();
    console.error(error);

    return (
        <div className="error-container">
            <div className="error-content">
                <h1>Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p>
                    <i>{error.statusText || error.message}</i>
                </p>
                <button className="error-home-button" type='button' onClick={() => navigate('/')}>
                    Go Home
                </button>
            </div>
        </div>
    );
}
import '../App.css'
import { useState } from 'react'

type LoginProps = {
    onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    return (
    <>
        <div className='App-body'>
            <h1 style={{ marginTop: "0"}}> {isLoggingIn ? "LOG IN" : "SIGN UP"} </h1>

            <div className='InputSection'>
                <div className='InputField'>
                    <label>EMAIL</label>
                    <input 
                        type="email" 
                        name="email_address" 
                        required
                    />
                </div>

                <div className='InputField'>
                    <label>PASSWORD</label>
                    <input 
                        type="password" 
                        name="password" 
                        required
                    />
                </div>

                {!isLoggingIn && 
                <div className='InputField'>
                    <label>CONFIRM PASSWORD</label>
                    <input 
                        type="password" 
                        name="confirm_password" 
                        required
                    />
                </div>
                }

                <button onClick={onLogin}>{isLoggingIn ? "LOG IN" : "SIGN UP"}</button>
                
                <button 
                onClick={() => setIsLoggingIn(!isLoggingIn)} 
                style={{ backgroundColor: "rgb(0, 0, 0, 0)", padding: "0"}}>
                    {isLoggingIn ? "I don't have an account" : "I have an account"}
                    </button>
            </div>
        </div>
    </>
    )
}
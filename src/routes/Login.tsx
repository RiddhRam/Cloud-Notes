import '../App.css'
import { useState } from 'react'

type LoginProps = {
    onLogin: (email: string, password: string, loggingIn: boolean) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const sanitizeInputs = () => {
        const sanitizedEmail = email.trim().toLowerCase()
        const sanitizedPassword = password.trim()
        const sanitizedConfirm = confirmPassword.trim()

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(sanitizedEmail)) {
            alert("Please enter a valid email address.")
            return null
        }

        if (sanitizedPassword.length < 6) {
            alert("Password must be at least 6 characters long.")
            return null
        }

        if (!isLoggingIn && sanitizedPassword !== sanitizedConfirm) {
            alert("Passwords do not match.")
            return null
        }

        return { sanitizedEmail, sanitizedPassword }
    }

    const handleSubmit = () => {
        const result = sanitizeInputs()
        if (result) {
            onLogin(result.sanitizedEmail, result.sanitizedPassword, isLoggingIn)
        }
    }

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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className='InputField'>
                    <label>PASSWORD</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {!isLoggingIn && 
                <div className='InputField'>
                    <label>CONFIRM PASSWORD</label>
                    <input 
                        type="password" 
                        name="confirm_password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                }

                <button onClick={handleSubmit}>{isLoggingIn ? "LOG IN" : "SIGN UP"}</button>
                
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
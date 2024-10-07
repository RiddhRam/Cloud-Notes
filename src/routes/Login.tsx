import '../App.css'
import { useState } from 'react'
import axios from 'axios'

interface ProfileData {
  profile_name: string
  about_me: string
}

export default function Login() {
    const [profileData, setProfileData] = useState<ProfileData | null>(null)

    function getData() {
        axios({
            method: "GET",
            url:"/profile",
        })
        .then((response) => {
            const res =response.data
            setProfileData(({
            profile_name: res.name,
            about_me: res.about}))
        }).catch((error) => {
            if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })
    }

    return (
    <>
        <div className='App-body'>

            <p>To get your profile details: </p><button onClick={getData}>Click me</button>
            {profileData && <div>
                <p>Profile name: {profileData.profile_name}</p>
                <p>About me: {profileData.about_me}</p>
                </div>
            }
        </div>
    </>
    )
}
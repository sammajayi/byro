import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer>
            <div className='flex p-8 space-x-10'>
            <div className='space-y-4'>
                <div className='logo'>
                    <Link href="/">
                    <Image src="/assets/images/logo.svg" alt="byro logo" width={100} height={40} />
                    </Link>
                </div>
                
                <div>
                    <p>
                        Seamless, Secure, and Decentralized Event Ticketing
                    </p>
                </div>

                <div className='flex space-x-1'>
                    <Link href="/">
                        <Image src="/assets/images/telegram.png" alt="" width={20} height={50} />
                    </Link>
                    
                    <Link href="/">
                        <Image src="/assets/images/facebook.png" alt="" width={20} height={100} />
                    </Link>
                    
                    <Link href="/">
                        <Image src="/assets/images/youtube.png" alt="" width={20} height={100} />
                    </Link>
                    
                    <Link href="/">
                        <Image src="/assets/images/x.png" alt="" width={20} height={100} />
                    </Link>
                </div>
            </div>

                <div className='flex space-x-20'>
                    <div>
                        <h5>About Us</h5>
                        <Link href="/">
                        <p>Terms of Use</p>
                        </Link>

                        <Link href="/">
                        <p>Service Policy</p>
                        </Link>
                    </div>

                    <div>
                        <h5>Services</h5>
                        <Link href="/">
                        <p>Event Ticketing</p>
                        </Link>

                        <Link href="/">
                        <p>Gaming</p>
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    )
}

export default Footer
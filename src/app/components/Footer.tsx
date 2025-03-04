import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer>
            <div className='flex flex-col justify-center items-center'>
            <div className='flex p-8 space-x-32 justify-center items-center'>
            <div className='space-y-4'>
                <div className='logo'>
                    <Link href="/">
                    <Image src="/assets/images/logo.svg" alt="byro logo" width={100} height={40} />
                    </Link>
                </div>
                
                <div>
                    <p className='text-sm font-normal'>
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

                <div className='flex space-x-20 '>
                    <div>
                        <h5 className='text-lg font-bold mb-5'>About Us</h5>
                        <Link href="/">
                        <p className='text-gray-400 text-sm mb-2'>Terms of Use</p>
                        </Link>

                        <Link href="/">
                        <p className='text-gray-400 text-sm'>Service Policy</p>
                        </Link>
                    </div>

                    <div>
                        <h5 className='text-lg font-bold mb-5'>Services</h5>
                        <Link href="/">
                        <p className='text-gray-400 text-sm mb-2'>Event Ticketing</p>
                        </Link>

                        <Link href="/">
                        <p className='text-gray-400 text-sm'>Gaming</p>
                        </Link>
                    </div>
                </div>
            </div>

            <hr className='border-t-2 border-gray-200 w-[80%]' />
            <p className='text-gray-400 text-xs text-center p-5'>&#169; Byro Africa. All Rights Reserved.</p>
            </div>
        </footer>
    )
}

export default Footer
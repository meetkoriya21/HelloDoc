import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>

        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

            {/* --------Left Section--------- */}
            <div>
                <img className='mb-5 w-40' src={assets.logo1} alt="" />
                <p className='w-full lg:w-2/3 md:w-2/2  text-gray-600 leading-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Est sed non in distinctio? Dignissimos explicabo quam impedit deserunt voluptas! Neque porro maxime nisi nemo natus unde explicabo assumenda earum cum.</p>
            </div>


            {/* ---------Center Section--------- */}

            <div>
                <p className='text-xl font-medium mb-5'>COMPANY</p>
                <ul className='flex flex-col gap-2 text-gray-600'> 
                    <li>Home</li>
                    <li>About us</li>
                    <li>Contact us</li>
                    <li>Privacy policy</li>

                </ul>
            </div>


            {/* -----------Right Section------ */}
            <div>
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>+91 9987521489</li>
                    <li>hellodoc@gmail.com</li>
                </ul>
            </div>
        </div>

        {/* ------Copyright Text-------- */}
        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2025@ HelloDoc - All rights reserved.</p>
        </div>

    </div>
  )
}

export default Footer

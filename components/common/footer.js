import React from "react";
import { FaWhatsapp, FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

const Footer = ({ header }) => {
  return (
    <footer className="p-10 footer bg-base-200 text-base-content footer-center">
      <div>
        <div className="grid grid-flow-col gap-4">{header}</div>
        <div className="mt-2 grid grid-flow-col gap-6">
          <a
            href={process.env.APP_URL.WHATSAPP}
            rel="noreferrer noopener"
            target="_blank"
          >
            <FaWhatsapp className="inline-block w-6 h-6 stroke-current" />
          </a>
          <a
            href={process.env.APP_URL.EMAIL}
            rel="noreferrer noopener"
            target="_blank"
          >
            <HiOutlineMail className="inline-block w-6 h-6 stroke-current" />
          </a>
          <a
            href={process.env.APP_URL.FB}
            rel="noreferrer noopener"
            target="_blank"
          >
            <FaFacebookF className="inline-block w-6 h-6 stroke-current" />
          </a>
          <a
            href={process.env.APP_URL.YOUTUBE}
            rel="noreferrer noopener"
            target="_blank"
          >
            <FaYoutube className="inline-block w-6 h-6 stroke-current" />
          </a>
          <a
            href={process.env.APP_URL.INSTAGRAM}
            rel="noreferrer noopener"
            target="_blank"
          >
            <FaInstagram className="inline-block w-6 h-6 stroke-current" />
          </a>
        </div>
      </div>
      <div>
        <p>Copyright © 2021 - All right reserved by NightMaths Ltd.</p>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";

import {
  FaPlus,
  FaArrowRight,
  FaTrash,
  FaTimes,
  FaCheck,
  FaEdit,
  FaClipboard,
  FaUserAlt,
  FaWhatsapp,
  FaFacebookF,
  FaPhoneAlt,
  FaTwitter,
  FaInstagram,
  FaInternetExplorer
} from "react-icons/fa";

import { MdArrowDropDown, MdOutlineMoreVert } from "react-icons/md";

const Icon = ({ name, src = "", size = "w-5 h-5", ...props }) => {
  if (name === "more") {
    return (
      <MdOutlineMoreVert
        className={`inline-block ${size} stroke-current`}
        {...props}
      />
    );
  }
  if (name === "yes") {
    return (
      <FaCheck className={`inline-block ${size} stroke-current`} {...props} />
    );
  }
  if (name === "no") {
    return (
      <FaTimes className={`inline-block ${size} stroke-current`} {...props} />
    );
  }
  if (name === "edit") {
    return (
      <FaEdit className={`inline-block ${size} stroke-current`} {...props} />
    );
  }
  if (name === "enter") {
    return (
      <FaArrowRight
        className={`inline-block ${size} stroke-current`}
        {...props}
      />
    );
  }
  if (name === "create") {
    return (
      <FaPlus className={`inline-block ${size} stroke-current`} {...props} />
    );
  }
  if (name === "destroy") {
    return (
      <FaTrash className={`inline-block ${size} stroke-current`} {...props} />
    );
  }
  if (name === "whatsapp") {
    return (
      <FaWhatsapp
        className={`inline-block ${size} stroke-current`}
        {...props}
      />
    );
  }
  if (name === "user") {
    return (
      <FaUserAlt className={`inline-block ${size} stroke-current`} {...props} />
    );
  }
  if (name === "website") {
    return (
      <FaInternetExplorer
        className={`inline-block ${size} stroke-current`}
        {...props}
      />
    );
  }
  if (name === "facebook") {
    return (
      <FaFacebookF
        className={`inline-block ${size} stroke-current`}
        {...props}
      />
    );
  }
  if (name === "twitter") {
    return (
      <FaTwitter className={`inline-block ${size} stroke-current`} {...props} />
    );
  }
  if (name === "instagram") {
    return (
      <FaInstagram
        className={`inline-block ${size} stroke-current`}
        {...props}
      />
    );
  }
  if (name === "contact") {
    return (
      <FaPhoneAlt
        className={`inline-block ${size} stroke-current`}
        {...props}
      />
    );
  }
  if (name === "clipboard") {
    return (
      <FaClipboard
        className={`inline-block ${size} stroke-current`}
        {...props}
      />
    );
  }
  if (name === "dropdown") {
    return (
      <MdArrowDropDown
        className={`inline-block ${size} stroke-current`}
        {...props}
      />
    );
  }

  return (
    <div className="avatar" {...props}>
      <div className={`${size} rounded-full`}>
        {src.length === 0 ? (
          <span className="text-xl">{name}</span>
        ) : (
          <img src={src} alt={`avatar ${name}`} />
        )}
      </div>
    </div>
  );
};

export default Icon;

import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import { TbWorld } from "react-icons/tb";
import Rappi from '../iconos/svg/rappi.avif';
import DidiFood from '../iconos/svg/didi food.svg';
import UberEats from "../iconos/svg/ubereats.svg";
import './SocialMedia.css';

const SocialMediaIcons = ({web, insta, face, rappi, uber, didi}) => {
  const socialMedia = [
    {
        icon: <TbWorld />,
        url: web,
        name: 'Webpage'
    },
    {
        icon: <img src={Rappi} alt="Rappi" className="custom-icon"/>,
        url: rappi,
        name: 'Rappi'
    },
    {
        icon: <img src={DidiFood} alt="Didi Food" className="custom-icon didi-food-icon"/>,
        url: didi,
        name: 'Didi Food'
    },
    {
        icon: <FaInstagram />,
        url: insta,
        name: 'Instagram'
    },
    {
      icon: <FaFacebook />,
      url: face,
      name: 'Facebook'
    },
    {
        icon: <img src={UberEats} alt="Uber Eats" className="custom-icon uber-eats-icon"/>,
        url: uber,
        name: 'UberEats'
    }
  ];

  return (
    <div className="social-media-container">
      {socialMedia.map((item, index) => (
        item.url ? (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.name}
            className="social-icon"
          >
            {item.icon}
          </a>
        ) : (
          <span
            key={index}
            className="social-icon disabled-icon"
            aria-label={`${item.name} no disponible`}
          >
            {item.icon}
          </span>
        )
      ))}
    </div>
  );
};

export default SocialMediaIcons;
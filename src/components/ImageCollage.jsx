"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export const ImageCollage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-scroll carousel on mobile
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageGroups.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [isMobile]);

  const imageGroups = [
    {
      id: 1,
      content: (
        <div
          className="flex-shrink-0 bg-blue-500 w-[272px] h-[325px] "
          style={{
            backgroundImage: "url(/images/collage/wine-glass.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="flex-shrink-0 flex flex-col">
          <div
            className="bg-red-500 w-[272px] h-[172px] "
            style={{
              backgroundImage: "url(/images/collage/group-toast.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div
            className="bg-green-700 w-[272px] h-[172px] mt-4 "
            style={{
              backgroundImage: "url(/images/collage/confetti.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className="flex-shrink-0 flex flex-col">
          <div
            className="bg-red-200 w-[272px] h-[280px] "
            style={{
              backgroundImage: "url(/images/collage/celebration.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div
            className="bg-green-300 w-[272px] h-[80px] mt-4 "
            style={{
              backgroundImage: "url(/images/collage/heart-background.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>
      ),
    },
    {
      id: 4,
      content: (
        <div
          className="flex-shrink-0 bg-blue-300 w-[272px] h-[286px] "
          style={{
            backgroundImage: "url(/images/collage/dinning.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      ),
    },
    {
      id: 5,
      content: (
        <div className="flex-shrink-0 flex flex-col">
          <div
            className="bg-red-300 w-[272px] h-[183px] "
            style={{
              backgroundImage: "url(/images/collage/talking.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div
            className="bg-green-500 w-[272px] h-[183px] mt-4 "
            style={{
              backgroundImage: "url(/images/collage/black-white-toast.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4">
        {/* Desktop View */}
        <div className="hidden md:flex space-x-5 items-center justify-start py-10 md:justify-center flex-nowrap">
          {imageGroups.map((group) => group.content)}
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden py-10">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {imageGroups.map((group, index) => (
                <div
                  key={group.id}
                  className="w-full flex-shrink-0 flex justify-center"
                >
                  {group.content}
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {imageGroups.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

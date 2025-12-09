/**
 * Animated Loader Component
 * Beautiful sparkle animation for loading states
 */
export const LoaderAnimation = () => {
  return (
    <>
      <style>{`
        .loader-animation {
          --fill-color: #0ea5e9;
          --shine-color: rgba(14, 165, 233, 0.2);
          transform: scale(0.5);
          width: 100px;
          height: auto;
          position: relative;
          filter: drop-shadow(0 0 20px var(--shine-color));
        }

        .loader-animation #pegtopone {
          position: absolute;
          animation: flowe-one 1s linear infinite;
        }

        .loader-animation #pegtoptwo {
          position: absolute;
          opacity: 0;
          transform: scale(0) translateY(-200px) translateX(-100px);
          animation: flowe-two 1s linear infinite;
          animation-delay: 0.3s;
        }

        .loader-animation #pegtopthree {
          position: absolute;
          opacity: 0;
          transform: scale(0) translateY(-200px) translateX(100px);
          animation: flowe-three 1s linear infinite;
          animation-delay: 0.6s;
        }

        .loader-animation svg g path:first-child {
          fill: var(--fill-color);
        }

        @keyframes flowe-one {
          0% {
            transform: scale(0.5) translateY(-200px);
            opacity: 0;
          }
          25% {
            transform: scale(0.75) translateY(-100px);
            opacity: 1;
          }
          50% {
            transform: scale(1) translateY(0px);
            opacity: 1;
          }
          75% {
            transform: scale(0.5) translateY(50px);
            opacity: 1;
          }
          100% {
            transform: scale(0) translateY(100px);
            opacity: 0;
          }
        }

        @keyframes flowe-two {
          0% {
            transform: scale(0.5) rotateZ(-10deg) translateY(-200px) translateX(-100px);
            opacity: 0;
          }
          25% {
            transform: scale(1) rotateZ(-5deg) translateY(-100px) translateX(-50px);
            opacity: 1;
          }
          50% {
            transform: scale(1) rotateZ(0deg) translateY(0px) translateX(-25px);
            opacity: 1;
          }
          75% {
            transform: scale(0.5) rotateZ(5deg) translateY(50px) translateX(0px);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotateZ(10deg) translateY(100px) translateX(25px);
            opacity: 0;
          }
        }

        @keyframes flowe-three {
          0% {
            transform: scale(0.5) rotateZ(10deg) translateY(-200px) translateX(100px);
            opacity: 0;
          }
          25% {
            transform: scale(1) rotateZ(5deg) translateY(-100px) translateX(50px);
            opacity: 1;
          }
          50% {
            transform: scale(1) rotateZ(0deg) translateY(0px) translateX(25px);
            opacity: 1;
          }
          75% {
            transform: scale(0.5) rotateZ(-5deg) translateY(50px) translateX(0px);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotateZ(-10deg) translateY(100px) translateX(-25px);
            opacity: 0;
          }
        }
      `}</style>

      <div className="loader-animation">
        <svg
          id="pegtopone"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 100 100"
        >
          <g>
            <path
              d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z"
              fill="currentColor"
            ></path>
          </g>
        </svg>
        <svg
          id="pegtoptwo"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 100 100"
        >
          <g>
            <path
              d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z"
              fill="currentColor"
            ></path>
          </g>
        </svg>
        <svg
          id="pegtopthree"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 100 100"
        >
          <g>
            <path
              d="M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z"
              fill="currentColor"
            ></path>
          </g>
        </svg>
      </div>
    </>
  );
};

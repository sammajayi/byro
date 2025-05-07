import Footer from "../components/Footer";
import NewHeroPage from "../components/NewHeroPage";
import EventSteps from "../components/EventSteps";
import RegisterSteps from "../components/RegisterSteps";
import Navbar from "../components/Navbar";
// import LoginButton from '../components/LoginButton';

export default function Home() {
  return (
    <>
      {/* <Navbar /> */}
      <NewHeroPage />
      <RegisterSteps />
      <EventSteps />
      {/* <Footer /> */}
    </>
  );
}

// <div className="flex flex-col min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
//   <header className="pt-4 pr-4">
//     <div className="flex justify-end">
//       <div className="wallet-container">
//         <Wallet>
//           <ConnectWallet>
//             <Avatar className="h-6 w-6" />
//             <Name />
//           </ConnectWallet>
//           <WalletDropdown>
//             <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
//               <Avatar />
//               <Name />
//               <Address />
//               <EthBalance />
//             </Identity>
//             <WalletDropdownLink
//               icon="wallet"
//               href="https://keys.coinbase.com"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               Wallet
//             </WalletDropdownLink>
//             <WalletDropdownDisconnect />
//           </WalletDropdown>
//         </Wallet>
//       </div>
//     </div>
//   </header>
// </div>

// app/page.tsx
// import Link from "next/link";

// export default function Home() {
//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <header className="mb-12">
//         <h1 className="text-4xl font-bold mb-4">Byro Africa</h1>
//         <p className="text-xl text-gray-600">Where Every Events Begins</p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div className="bg-white rounded-lg shadow-md p-8">
//           <h2 className="text-2xl font-semibold mb-4">Discover Events</h2>
//           <p className="text-gray-600 mb-6">
//             Find and participate in amazing events happening around you.
//           </p>
//           <Link
//             href="/events"
//             className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
//           >
//             Browse Events
//           </Link>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-8">
//           <h2 className="text-2xl font-semibold mb-4">Host Your Own Event</h2>
//           <p className="text-gray-600 mb-6">
//             Create and manage your own events with our powerful platform.
//           </p>
//           <Link
//             href="/events/create"
//             className="inline-block bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
//           >
//             Create Event
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

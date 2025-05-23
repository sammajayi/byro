   // src/components/ErrorBoundary.jsx
   import React from 'react';

   class ErrorBoundary extends React.Component {
     constructor(props) {
       super(props);
       this.state = { hasError: false };
     }

     static getDerivedStateFromError(error) {
       return { hasError: true };
     }

     componentDidCatch(error, errorInfo) {
       console.error("Error caught by boundary:", error, errorInfo);
     }

     render() {
       if (this.state.hasError) {
         return (
           <div className="text-center p-8">
             <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
             <button
               onClick={() => window.location.reload()}
               className="bg-blue-500 text-white py-2 px-4 rounded"
             >
               Reload Page
             </button>
           </div>
         );
       }

       return this.props.children;
     }
   }

   export default ErrorBoundary;
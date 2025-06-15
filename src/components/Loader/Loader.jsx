// Loader component displays a loading animation overlay
export function Loader() {
    return (
        <div className="flex justify-center items-center fixed top-0 left-0 w-screen h-screen bg-gray-300 dark:bg-gray-900 opacity-60 z-50">
            <div className="flex space-x-2">
                <span className="w-3 h-3 bg-green-900 dark:bg-white rounded-full animate-bounce"></span>
                <span className="w-3 h-3 bg-green-900 dark:bg-white rounded-full animate-bounce delay-150"></span>
                <span className="w-3 h-3 bg-green-900 dark:bg-white rounded-full animate-bounce delay-300"></span>
            </div>
        </div>
    );
}
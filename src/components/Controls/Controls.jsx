import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import TextareaAutosize from "react-textarea-autosize";

export function Controls({ isDisabled = false, onSend }) {
    const textarea = useRef(null);
    const [content, setContent] = useState("");

    // Focus the textarea when not disabled
    useEffect(() => {
        if (!isDisabled) textarea.current.focus();
    }, [isDisabled]);

    // Update content state as user types
    function handleContentChange(event) {
        setContent(event.target.value);
    }

    // Send the message and clear the input
    function handleContentSend() {
        if (content.length > 0) onSend(content);
        setContent("");
    }

    // Handle Enter key to send message (Shift+Enter for newline)
    function handleEnterPress(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleContentSend();
        }
    }

    return (
        <div className="Controls flex gap-2 w-full px-3 py-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 transition-colors duration-300">
            {/* Text Area */}
            <div className="Text-Area-Container flex-grow px-2 py-2 bg-white dark:bg-gray-800 rounded-2xl transition-colors duration-300">
                <TextareaAutosize
                    ref={textarea}
                    className="w-full h-12 resize-none rounded-none border-none outline-none focus:ring-0 bg-white dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 overflow-auto custom-scrollbar transition-colors duration-300"
                    disabled={isDisabled}
                    placeholder="Message AI Chatbot"
                    value={content}
                    minRows={2}
                    maxRows={4}
                    onChange={handleContentChange}
                    onKeyDown={handleEnterPress}
                />
            </div>

            {/* Send Button */}
            <button
                onClick={handleContentSend}
                disabled={isDisabled}
                className={`flex items-center justify-center bg-green-400 hover:bg-green-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-white w-12 h-12 rounded-full transition duration-300 mt-2.5 ${
                    isDisabled ? "opacity-35 cursor-not-allowed" : ""
                }`}
            >
                <SendIcon />
            </button>
        </div>
    );
}

Controls.propTypes = {
    isDisabled: PropTypes.bool,
    onSend: PropTypes.func.isRequired,
};

// SVG icon for the send button
function SendIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 -960 960 960"
            fill="currentColor"
        >
            <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
        </svg>
    );
}
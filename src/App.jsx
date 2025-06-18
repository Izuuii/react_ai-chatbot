import { useState, useEffect } from "react";
import { Assistant } from "./assistants/googleai"; // Only using Google AI
import { Chat } from "./components/Chat/Chat";
import { Controls } from "./components/Controls/Controls";
import { Loader } from "./components/Loader/Loader";
import { Switch } from "@headlessui/react"; // Import headless UI switch

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIstreaming] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  

  const assistant = new Assistant();


  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);


function updateLastMessageContent(content) {
  setMessages((prevMessages) =>
    prevMessages.map((message, index) =>
      index === prevMessages.length - 1
        ? { ...message, content: message.content + content }
        : message
    )
  );
}

  // Add a new message to the chat history
  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  // Handle sending user content to the assistant and updating chat
  async function handleContentSend(content) {
    addMessage({ content, role: "user" }); // Add user message
    setIsLoading(true); // Show loader
    try {
      const result = await assistant.chatStream(content, messages); // Get assistant response
      let isFirstChunk = false
      
      for await (const chunk of result){
        if (!isFirstChunk){
          isFirstChunk = true
          addMessage({ content: "", role: "assistant" })
          setIsLoading(false)
          setIstreaming(true)
        }
        updateLastMessageContent(chunk)
      }
      setIstreaming(false)
      
    } catch (error) {
      console.error("Error during chat:", error);
      let errorMsg = "Sorry, I couldn't process your request. Please try again!";
      if (error.status === 429) {
        errorMsg = "You have exceeded your OpenAI quota or rate limit. Please check your OpenAI account billing and usage.";
      }
      if (error.status === 402) {
        errorMsg = "Insufficient balance on your DeepSeek account. Please check your API credits or billing.";
      }
      addMessage({
        content: errorMsg,
        role: "system",
      });
      setIsLoading(false)
      setIstreaming(false)
    }
  }
// ...ex

  return (
    <div className="flex flex-col min-h-screen items-center gap-4 px-2 sm:px-6 md:px-12 lg:px-24 py-4 sm:py-8 bg-green-300 dark:bg-gray-900 dark:text-white">
      {/* Show Loader when loading */}
      {isLoading && <Loader />}

      {/* Header */}
      <header className="flex flex-row items-center text-center py-3 w-full justify-between">
        <div className="flex flex-row gap-2 items-center">
          <img className="w-16 h-16" src="/chat-bot.png" alt="Chatbot Logo" />
          <h2 className="m-0 text-xl font-semibold">AI Chatbot</h2>
        </div>
        <div className="flex flex-row gap-2 items-center">
          {/* Dark Mode Toggle */}
          <Switch
            checked={isDarkMode}
            onChange={setIsDarkMode}
            className={`relative inline-flex h-[27px] w-[45px] items-center rounded-full transition duration-300 
              ${isDarkMode ? "bg-gray-700" : "bg-green-100"}`}
          >
            <span
              className={`inline-block h-[22px] w-[22px] transform rounded-full transition
                ${isDarkMode ? "translate-x-5 bg-white" : "translate-x-1 bg-green-300"}`}
            />
          </Switch>
        </div>
      </header>

      {/* Chat Container */}
      <div className="ChatContainer flex-grow w-full bg-green-100 rounded-2xl overflow-y-auto p-3 dark:bg-gray-800">
        <Chat messages={messages} />
      </div>

      {/* Input Controls */}
      <div className="w-full">
        <Controls isDisabled={isLoading || isStreaming} onSend={handleContentSend} />
      </div>
    </div>
  );
}

export default App;
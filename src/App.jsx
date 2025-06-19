import { useState, useEffect, useRef } from "react";
import { Assistant as GoogleAssistant } from "./assistants/googleai";
import { Assistant as OpenAIAssistant } from "./assistants/openai";
import { Assistant as DeepSeekAssistant } from "./assistants/googleai";
import { Chat } from "./components/Chat/Chat";
import { Controls } from "./components/Controls/Controls";
import { Loader } from "./components/Loader/Loader";
import { Switch } from "@headlessui/react";

const ASSISTANTS = [
  { key: "google", name: "Gemini", instance: GoogleAssistant },
  { key: "openai", name: "OpenAI", instance: OpenAIAssistant },
  { key: "deepseek", name: "DeepSeek", instance: DeepSeekAssistant },
];

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIstreaming] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [selectedAssistant, setSelectedAssistant] = useState(ASSISTANTS[0].key);
  const assistantRef = useRef(new ASSISTANTS[0].instance());

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add("dark");
    else html.classList.remove("dark");
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const assistantObj = ASSISTANTS.find(a => a.key === selectedAssistant);
    assistantRef.current = new assistantObj.instance();
    setMessages([]);
  }, [selectedAssistant]);

  function updateLastMessageContent(content) {
    setMessages((prevMessages) =>
      prevMessages.map((message, index) =>
        index === prevMessages.length - 1
          ? { ...message, content: message.content + content }
          : message
      )
    );
  }

  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  async function handleContentSend(content) {
    addMessage({ content, role: "user" });
    setIsLoading(true);
    try {
      const result = await assistantRef.current.chatStream(content, messages);
      let isFirstChunk = false;
      for await (const chunk of result) {
        if (!isFirstChunk) {
          isFirstChunk = true;
          addMessage({ content: "", role: "assistant" });
          setIsLoading(false);
          setIstreaming(true);
        }
        updateLastMessageContent(chunk);
      }
      setIstreaming(false);
    } catch (error) {
      console.error("Error during chat:", error);
      let errorMsg = "Sorry, I couldn't process your request. Please try again!";
      if (error.status === 429) {
        errorMsg = "You have exceeded your OpenAI quota or rate limit. Please check your OpenAI account billing and usage.";
      }
      if (error.status === 402) {
        errorMsg = "Insufficient balance on your DeepSeek account. Please check your API credits or billing.";
      }
      addMessage({ content: errorMsg, role: "system" });
      setIsLoading(false);
      setIstreaming(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
      {isLoading && <Loader />}

      {/* Inner padded wrapper (x-axis padding) */}
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-4 sm:py-8 flex flex-col gap-4 flex-grow">

        {/* Header */}
        <header className="flex flex-row items-center text-center py-3 w-full justify-between">
          <div className="flex flex-row gap-2 items-center">
            <img className="w-16 h-16" src="/chat-bot.png" alt="Chatbot Logo" />
            <h2 className="m-0 text-xl font-semibold">AI Chatbot</h2>
          </div>
          <div className="flex flex-row gap-4 items-center">
            {/* Assistant Dropdown */}
            <select
              className="rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
              value={selectedAssistant}
              onChange={e => setSelectedAssistant(e.target.value)}
              disabled={isLoading || isStreaming}
            >
              {ASSISTANTS.map(a => (
                <option key={a.key} value={a.key}>{a.name}</option>
              ))}
            </select>

            {/* Dark Mode Switch */}
            <Switch
              checked={isDarkMode}
              onChange={setIsDarkMode}
              className={`relative inline-flex h-[27px] w-[45px] items-center rounded-full transition duration-300 
                ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-[22px] w-[22px] transform rounded-full transition
                  ${isDarkMode ? "translate-x-5 bg-white" : "translate-x-1 bg-white"}`}
              />
            </Switch>
          </div>
        </header>

        {/* Chat Area */}
        <div className="ChatContainer flex-grow w-full bg-white overflow-y-auto p-3 dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 transition-colors duration-300">
          <Chat messages={messages} />
        </div>

        {/* Input Controls */}
        <div className="w-full">
          <Controls isDisabled={isLoading || isStreaming} onSend={handleContentSend} />
        </div>
      </div>
    </div>
  );
}

export default App;

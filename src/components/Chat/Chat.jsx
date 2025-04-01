import { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Optional for better markdown support

const WELCOME_MESSAGE_GROUP = [[{
  role: "assistant",
  content: "Hello! How can I assist you right now?",
}]];

export function Chat({ messages }) {
  const messagesEndRef = useRef(null);

  const messageGroups = useMemo(() => 
    messages.reduce((groups, message) => {
      if (message.role === "user") groups.push([]);
      if (groups.length === 0) groups.push([]);
      groups[groups.length - 1].push(message);
      return groups;
    }, [])
  , [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  return (
    <div className="Chat flex flex-col gap-1.5 h-full p-3 overflow-y-auto">
      {[...WELCOME_MESSAGE_GROUP, ...messageGroups].map((messages, groupIndex, array) => (
        <div
          key={groupIndex}
          className={`Group flex flex-col gap-1.5 ${
            groupIndex === array.length - 1 ? "min-h-[calc(10%-8px)]" : ""
          }`}
        >
          {messages.map(({ role, content }, index) => (
            <div
              key={index}
              className={`Messages max-w-[75%] px-4 py-2 rounded-lg text-md break-words whitespace-pre-wrap
                ${role === "user"
                  ? "bg-green-300 text-gray-900 dark:bg-gray-950 dark:text-white self-end"
                  : "bg-green-200 text-gray-900 dark:bg-gray-900 dark:text-gray-200 self-start"
                }`}
              data-role={role}
            >
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: (props) => (
                  <div className="overflow-x-auto bg-gray-900 text-white p-3 rounded-lg dark:bg-green-700 dark:text-[#333333]">
                    <pre className="whitespace-pre-wrap" {...props} />
                  </div>
                ),
                code: ({ inline, ...props }) =>
                  inline ? (
                    <code className="bg-gray-200 text-gray-900 px-1 rounded dark:bg-gray-600 dark:text-black" {...props} />
                  ) : (
                    <pre className="overflow-x-auto bg-gray-900 text-white p-3 rounded-lg dark:bg-green-700 dark:text-black">
                      <code className="whitespace-pre" {...props} />
                    </pre>
                  ),
              }}
            >
              {content}
            </Markdown>
            </div>
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} className="invisible" />
    </div>
  );
}

Chat.propTypes = {
  messages: PropTypes.array.isRequired,
};

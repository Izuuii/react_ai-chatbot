import { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WELCOME_MESSAGE_GROUP = [[{
  role: "assistant",
  content: "Hello! How can I assist you right now?",
}]];

export function Chat({ messages }) {
  const messagesEndRef = useRef(null);

  // Group messages by user/assistant turns for display
  const messageGroups = useMemo(() =>
    messages.reduce((groups, message) => {
      if (message.role === "user") groups.push([]);
      if (groups.length === 0) groups.push([]);
      groups[groups.length - 1].push(message);
      return groups;
    }, [])
  , [messages]);

  // Always scroll to the last message when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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
                  code({node, inline, className, children, ...props}) {
                    if (inline) {
                      return (
                        <code
                          className="bg-gray-200 text-gray-900 px-1 rounded dark:bg-gray-600 dark:text-black"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="overflow-x-auto bg-gray-900 text-white p-3 rounded-lg dark:bg-green-700 dark:text-black">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                }}
              >
                {content}
              </Markdown>
            </div>
          ))}
        </div>
      ))}
      {/* Always scroll to the last message */}
      <div ref={messagesEndRef} />
    </div>
  );
}

Chat.propTypes = {
  messages: PropTypes.array.isRequired,
};
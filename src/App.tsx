import { useEffect, useRef, useState } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
import axios from "axios";
import LoadingScreen from "./components/LoadingScreen";

enum CreatedByOptions {
  CHAT_BOT = "chatBot",
  USER = "user",
}

type Message = {
  id: string;
  content: string;
  createdBy: CreatedByOptions;
  createdAt: string;
};

const plainCopyTextEventHandler = (e: ClipboardEvent) => {
  e.preventDefault();

  if (!e.clipboardData) return;

  const text = e.clipboardData.getData("text/plain");

  document.execCommand("insertHTML", false, text);
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const inputElementRef = useRef<HTMLDivElement>(null);
  const messagesElementRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (messagesElementRef.current) {
      messagesElementRef.current.scrollTop =
        messagesElementRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const currentInputElement = inputElementRef.current;
    if (!currentInputElement) {
      return;
    }

    currentInputElement.addEventListener(
      "paste",
      plainCopyTextEventHandler,
      true
    );

    return () => {
      currentInputElement.removeEventListener(
        "paste",
        plainCopyTextEventHandler,
        true
      );
    };
  }, []);

  return (
    <div className="fixed flex justify-center items-center inset-0 bg-zinc-500">
      {isLoading && <LoadingScreen />}
      <div className="flex flex-col bg-white w-full h-full max-w-xl shadow-md shadow-black">
        <div
          ref={messagesElementRef}
          className="flex flex-col h-full w-full overflow-y-auto bg-zinc-100"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 p-4 ${
                message.createdBy === CreatedByOptions.USER
                  ? "flex-row-reverse"
                  : ""
              }`}
            >
              <div className="shrink-0 grow-0 w-8 h-8 rounded-full overflow-hidden border">
                <img
                  src={
                    message.createdBy === CreatedByOptions.USER
                      ? "/user-picture.webp"
                      : "/ai-picture.png"
                  }
                  className="object-cover w-8 h-8"
                  alt=""
                />
              </div>
              <div className="whitespace-pre-wrap text-sm flex flex-col justify-center">
                <div className="text-xs text-zinc-500">
                  {new Date(message.createdAt).toLocaleString()}
                </div>
                <div
                  className={`flex ${
                    message.createdBy === CreatedByOptions.USER
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-md max-w-[240px] ${
                      message.createdBy === CreatedByOptions.USER
                        ? "bg-blue-200"
                        : "bg-gray-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 justify-center items-center max-h-52 bg-zinc-200 w-full p-4">
          <div
            ref={inputElementRef}
            contentEditable
            className="static w-full focus:outline-none focus:border-blue-200 border-transparent border bg-white rounded-md h-full whitespace-pre-wrap overflow-y-auto p-2"
            onInput={(e) =>
              setQuestion((e.target as HTMLDivElement).innerText || "")
            }
          />
          <div>
            <RiSendPlaneFill
              className="cursor-pointer bg-blue-600 rounded-full p-2 text-4xl text-white"
              onClick={() => {
                setMessages((messages) => [
                  ...messages,
                  {
                    id: crypto.randomUUID(),
                    createdBy: CreatedByOptions.USER,
                    createdAt: new Date().toISOString(),
                    content: question,
                  },
                ]);
                if (inputElementRef.current) {
                  inputElementRef.current.innerText = "";
                }
                setIsLoading(true);

                axios
                  .post(`${import.meta.env.VITE_BACKEND_URL}/api/chat_bot/`, {
                    question,
                  })
                  .then((res) => {
                    setIsLoading(false);
                    setMessages((messages) => [
                      ...messages,
                      {
                        id: crypto.randomUUID(),
                        createdBy: CreatedByOptions.CHAT_BOT,
                        createdAt: new Date().toISOString(),
                        content: res.data.response,
                      },
                    ]);
                  })
                  .catch(console.error);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";

function ForgotPasswordWrapper({ togglePage, setNowUsername }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState({ username: "", email: "", verificationCode: "" });
  const [step, setStep] = useState("send"); // 'send' or 'verify'
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getClockHands = () => {
    const hours = currentTime.getHours() % 12;
    const minutes = currentTime.getMinutes();
    const hourAngle = hours * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    const hourHandLength = 35;
    const minuteHandLength = 45;
    return {
      hourHand: {
        x2: 100 + hourHandLength * Math.sin((hourAngle * Math.PI) / 180),
        y2: 100 - hourHandLength * Math.cos((hourAngle * Math.PI) / 180),
      },
      minuteHand: {
        x2: 100 + minuteHandLength * Math.sin((minuteAngle * Math.PI) / 180),
        y2: 100 - minuteHandLength * Math.cos((minuteAngle * Math.PI) / 180),
      },
    };
  };

  const getMedicalCross = () => {
    const minutes = currentTime.getMinutes();
    const minuteAngle = minutes * 6;
    const centerDistance = 30;
    const centerX = 100 + centerDistance * Math.sin((minuteAngle * Math.PI) / 180);
    const centerY = 100 - centerDistance * Math.cos((minuteAngle * Math.PI) / 180);
    return {
      horizontal: {
        x: centerX - 15,
        y: centerY - 4,
      },
      vertical: {
        x: centerX - 4,
        y: centerY - 15,
      },
    };
  };

  const { hourHand, minuteHand } = getClockHands();
  const cross = getMedicalCross();

  const sendCodeHandler = async () => {
    const newError = { username: "", email: "", verificationCode: "" };
    let isValid = true;
    if (!username.trim()) {
      newError.username = "*請輸入帳號";
      isValid = false;
    }
    if (!email.trim()) {
      newError.email = "*請輸入信箱";
      isValid = false;
    }
    setError(newError);
    if (!isValid) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/login/sendVerificationCode`, {
        username,
        email,
      });
      setMessage(res.data);
      setStep("verify");
    } catch (err) {
      setMessage("發送驗證碼失敗，請確認帳號與信箱是否正確");
    }
  };

  const confirmHandler = async () => {
    const newError = { username: "", email: "", verificationCode: "" };
    let isValid = true;

    if (!verificationCode.trim()) {
      newError.verificationCode = "*請輸入驗證碼";
      isValid = false;
    }

    setError(newError);
    if (!isValid) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/login/ForgotPassword`, {
        username,
        email,
        verificationCode,
      });

      if (res.data === 1) {
        setNowUsername(username);
        togglePage("changePasswordPage");
      } else {
        setMessage("驗證失敗，請確認驗證碼是否正確");
      }
    } catch {
      setMessage("驗證過程發生錯誤，請稍後再試");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* 上方與下方波浪省略（你已有） */}
      {/* 上方波浪 */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg className="w-full" style={{ marginTop: "-1px" }} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            className="fill-blue-400 opacity-60"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            className="fill-blue-300 opacity-60"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-blue-200 opacity-60"
          ></path>
        </svg>
      </div>

      {/* 底部波浪 */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
        <svg className="w-full" style={{ marginBottom: "-1px" }} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            className="fill-blue-100 opacity-40"
          ></path>
        </svg>
      </div>
      <div className="z-10 bg-white bg-opacity-95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-blue-50 hover:shadow-blue-100 transition duration-300 relative">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-20 h-20 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="90" fill="#0d6efd" />
              <circle cx="100" cy="100" r="75" fill="#FFFFFF" />
              <line x1="100" y1="40" x2="100" y2="50" stroke="#0d6efd" strokeWidth="5" />
              <line x1="100" y1="150" x2="100" y2="160" stroke="#0d6efd" strokeWidth="5" />
              <line x1="40" y1="100" x2="50" y2="100" stroke="#0d6efd" strokeWidth="5" />
              <line x1="150" y1="100" x2="160" y2="100" stroke="#0d6efd" strokeWidth="5" />
              <line x1="100" y1="100" x2={hourHand.x2} y2={hourHand.y2} stroke="#0d6efd" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="100" x2={minuteHand.x2} y2={minuteHand.y2} stroke="#0d6efd" strokeWidth="4" strokeLinecap="round" />
              <circle cx="100" cy="100" r="8" fill="#0d6efd" />
              <rect x={cross.horizontal.x} y={cross.horizontal.y} width="30" height="8" rx="4" fill="#0d6efd" transform={`rotate(${currentTime.getMinutes() * 6}, ${cross.horizontal.x + 15}, ${cross.horizontal.y + 4})`} />
              <rect x={cross.vertical.x} y={cross.vertical.y} width="8" height="30" rx="4" fill="#0d6efd" transform={`rotate(${currentTime.getMinutes() * 6}, ${cross.vertical.x + 4}, ${cross.vertical.y + 15})`} />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-1">MedTime</h1>
          <p className="text-sm text-blue-600 font-medium">找回密碼</p>
        </div>

        <div className="space-y-6 relative z-10">
          {/* 帳號 */}
          <div>
            <div className="relative">
              <input
                className="w-full pl-10 pr-4 py-3 bg-blue-50 bg-opacity-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-blue-300"
                placeholder="帳號"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {error.username && <p className="text-sm text-red-600 mt-1">{error.username}</p>}
          </div>
          {/* 信箱 */}
          <div>
            <input
              className="w-full pl-10 pr-4 py-3 bg-blue-50 bg-opacity-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-400 placeholder-blue-300"
              placeholder="電子信箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            {error.email && <p className="text-sm text-red-600 mt-1">{error.email}</p>}
          </div>

          {/* 驗證碼（僅在 step === 'verify' 顯示） */}
          {step === "verify" && (
            <div>
              <input
                className="w-full pl-10 pr-4 py-3 bg-blue-50 bg-opacity-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-400 placeholder-blue-300"
                placeholder="驗證碼"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              {error.verificationCode && <p className="text-sm text-red-600 mt-1">{error.verificationCode}</p>}
            </div>
          )}

          {/* 訊息提示 */}
          {message && (
            <div className="py-2 px-3 bg-red-50 text-center rounded-md">
              <p className="text-sm text-red-600">{message}</p>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex justify-between items-center pt-2">
            <button className="text-sm text-blue-700 hover:underline" onClick={() => togglePage("loginPage")}>返回登入</button>
            {step === "send" ? (
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700" onClick={sendCodeHandler}>
                發送驗證碼
              </button>
            ) : (
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700" onClick={confirmHandler}>
                確認
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordWrapper;

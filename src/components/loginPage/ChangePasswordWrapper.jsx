import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";

function ChangePasswordWrapper({ togglePage, username }) {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [message, setMessage] = useState("");
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [error, setError] = useState({
    newPassword: "",
    newPasswordAgain: "",
    passwordNotEqquals: "",
  });

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

  const confirmHandler = () => {
    let notEmpty = true;
    const newError = {
      newPassword: "",
      newPasswordAgain: "",
      passwordNotEqquals: "",
    };
    if (!newPassword.trim()) {
      newError.newPassword = "*請輸入新密碼";
      notEmpty = false;
    }
    if (newPassword.trim() && !newPasswordAgain.trim()) {
      newError.newPasswordAgain = "*請再次輸入新密碼";
      notEmpty = false;
    }
    if (notEmpty) {
      if (newPassword === newPasswordAgain) {
        changePasswordHandler();
      } else {
        newError.passwordNotEqquals = "*兩個密碼不相同";
      }
    }
    setError(newError);
  };

  const changePasswordHandler = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/login/changePassword/${username}`,
        {
          password: newPassword,
        }
      );
      setMessage(response.data);
      if (response.data === "Change Password successfully") {
        setPasswordChanged(true);
      }
    } catch {
      setMessage("密碼更新時發生錯誤");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white overflow-hidden">
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
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg className="w-full" style={{ marginTop: "-1px" }} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79..." className="fill-blue-400 opacity-60" />
          <path d="M0,0V15.81C13..." className="fill-blue-300 opacity-60" />
          <path d="M0,0V5.63C149..." className="fill-blue-200 opacity-60" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
        <svg className="w-full" style={{ marginBottom: "-1px" }} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79..." className="fill-blue-100 opacity-40" />
        </svg>
      </div>

      <div className="z-10 bg-white bg-opacity-95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-blue-50 hover:shadow-blue-100 transition duration-300 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12 z-0 opacity-70"></div>

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
          <p className="text-sm text-blue-600 font-medium">變更密碼</p>
        </div>

        {!passwordChanged ? (
          <div className="space-y-4">
            <input className="w-full px-4 py-3 text-gray-700 bg-blue-50 bg-opacity-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-blue-300" placeholder="新密碼" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            {error.newPassword && <p className="text-sm text-red-600">{error.newPassword}</p>}

            <input className="w-full px-4 py-3 text-gray-700 bg-blue-50 bg-opacity-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-blue-300" placeholder="再次輸入新密碼" type="password" value={newPasswordAgain} onChange={(e) => setNewPasswordAgain(e.target.value)} />
            {error.newPasswordAgain && <p className="text-sm text-red-600">{error.newPasswordAgain}</p>}
            {error.passwordNotEqquals && <p className="text-sm text-red-600">{error.passwordNotEqquals}</p>}

            <div className="flex justify-between pt-2">
              <button className="text-sm text-blue-700 hover:text-blue-800 hover:underline" onClick={() => togglePage("loginPage")}>返回登入</button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform transition hover:scale-105" onClick={confirmHandler}>確認</button>
            </div>
            {message && <p className="text-sm text-red-600 text-center">{message}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg w-full text-center">
              <p className="font-semibold">密碼更新成功</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform transition hover:scale-105" onClick={() => togglePage("loginPage")}>返回登入</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangePasswordWrapper;

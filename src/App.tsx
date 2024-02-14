import QRCode from 'qrcode'
import { FormEvent, useState } from 'react'
import './App.css'

const App = () => {
  const [qrCode, setQrCode] = useState('');
  const [userText, setUserText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);
  const [consoleText, setConsoleText] = useState([<span>Hello! I'm a QR code generator.</span>, <span>Please enter your text and press the red button:</span>])

  const handleSubmit = (e:FormEvent<HTMLFormElement>, data:string) => {
    e.preventDefault();

    if (!isAnimate && data) {
      setIsAnimate(true);
      
      if (!isActive) {
        GenerateQRCode(data)
        setTimeout(() => {
          setIsAnimate(false);
        }, 630);
      } else {
        setIsActive(false);
        setTimeout(() => {
          setIsAnimate(false);
          GenerateQRCode(data)
        }, 630);
      }
    }
  };

  const GenerateQRCode = (data:string) => {
    QRCode.toDataURL(data, {
        width: 220,
        color: {
            dark: '#335383FF',
        }
    }, (err, url) => {
        if (err) return console.error(err)
        setQrCode(url)
        setIsActive(true);
        setConsoleText([...consoleText, <span>{data}</span>, <span>QR code generated! You can enter a new text:</span>])
        setUserText('');
    })
  };

  const imageToBlob = async() => {
    if (qrCode) {
      const response = await fetch(qrCode);
      const blob = await response.blob();
      return blob;
    } else {
      setConsoleText([...consoleText, <span className="printer__error">ERROR: First you need to generate a QR code!</span>]);
      throw new Error('First you need to generate a QR code!');
    }
  }

  const handleCopy = async() => {
    try {
      const imageBlob = await imageToBlob()
      navigator.clipboard.write([
          new ClipboardItem({
            'image/png': imageBlob
          })
      ]);
    } catch(e:any) {
      console.log(e.message)
    }
  };

  const handleDownload = async() => {
    try {
      const file = await imageToBlob();
      const element = document.createElement("a");
      element.href = URL.createObjectURL(file);
      element.download = "your-qr.png";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch(e:any) {
      console.log(e.message)
    }
  };

  return (
    <div className="container">
      <form className="printer" onSubmit={(e) => handleSubmit(e, userText)}>
        <div className="printer__screen">
            {consoleText.map((text, i) => <p key={i} className='printer__text'>{'> '}{text}</p>)}
            <p className='printer__text'>{'>'} <input value={userText} onChange={(e) => setUserText(e.target.value)} type="text" className="printer__input"/></p>
        </div>
        <div className="printer__btns">
          <div className='printer__btns__left'>
            <button className="printer__btn printer__btn-copy" onClick={handleCopy} />
            <button className="printer__btn printer__btn-download" onClick={handleDownload} />
          </div>
          <input id="button" type="submit" className='printer__generate'/> 
          <label className={isAnimate ? "printer__btn-generate printer__btn-generate--active" : "printer__btn-generate"} htmlFor="button" />
        </div>
        <div className={isActive ? "paper paper-active" : "paper"}>{qrCode && <img src={qrCode} alt="QR-Code" />}</div>
      </form>
      <div className="trace"></div>
    </div>
  )
}

export default App;

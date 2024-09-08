'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const Toast: React.FC<ToastProps> & { notify: (props: ToastProps) => void } = ({ type = 'info', message, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  if (!isVisible) return null

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-blue-500'

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md text-white ${bgColor} shadow-lg`}>
      {message}
    </div>
  )
}

Toast.notify = ({ type, message, duration }: ToastProps) => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const handleRemove = () => {
    ReactDOM.unmountComponentAtNode(container)
    container.remove()
  }

  ReactDOM.render(
    <Toast type={type} message={message} duration={duration} />,
    container
  )

  setTimeout(handleRemove, duration || 3000)
}

export default Toast
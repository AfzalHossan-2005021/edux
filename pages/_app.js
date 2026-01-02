import Head from 'next/head'
import '@/styles/globals.css'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { useEffect, useState } from 'react'
import { TranslationProvider } from '@/lib/i18n'
import { registerServiceWorker, setupInstallPrompt } from '@/lib/pwa'
import { ThemeProvider } from '@/context/ThemeContext'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App({ Component, pageProps }) {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [canInstall, setCanInstall] = useState(false)


  const [cart, setCart] = useState({})
  const [subTotal, setSubTotal] = useState(0)

  const saveCart = (myCart) => {
    let subt = 0
    let keys = Object.keys(myCart)
    for (let i = 0; i < keys.length; i++) {
      subt += myCart[keys[i]].price * myCart[keys[i]].qty;
    }
    setSubTotal(subt)
    localStorage.setItem("cart", JSON.stringify(myCart))
  }

  const addToCart = (itemCode, qty, price, title) => {
    let newCart = cart;
    if (itemCode in cart) {
      newCart[itemCode].qty = cart[itemCode].qty + qty
    }
    else {
      newCart[itemCode] = { qty: 1, price, title }
    }
    saveCart(newCart)
    setCart(newCart)
  }

  const removeFromCart = (itemCode, qty) => {
    let newCart = cart;
    if (itemCode in cart) {
      newCart[itemCode].qty = cart[itemCode].qty - qty
    }
    if (newCart[itemCode].qty <= 0) {
      delete newCart[itemCode]
    }
    saveCart(newCart)
    setCart(newCart)
  }

  const clearCart = () => {
    setCart({})
    saveCart({})
  }

  useEffect(() => {
    try {
      if (localStorage.getItem("cart")) {
        setCart(JSON.parse(localStorage.getItem("cart")))
      }
    } catch {
      localStorage.clear()
    }

    // Register service worker for PWA
    if (typeof window !== 'undefined') {
      registerServiceWorker();
      setupInstallPrompt(setCanInstall);
    }
  }, [])

  return <>
    <Head>
      <title>EduX</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="description" content="EduX - Unlock your potential with online courses" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
    </Head>
    <ErrorBoundary>
      <TranslationProvider>
        <ThemeProvider>
          <Navbar isLoggedIn={isLoggedIn} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} clearCart={clearCart} subTotal={subTotal} />
          <Component isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} clearCart={clearCart} subTotal={subTotal} {...pageProps} />
          <Footer />
        </ThemeProvider>
      </TranslationProvider>
    </ErrorBoundary>
  </>
}

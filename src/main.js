import gsap from 'gsap'
import Draggable from "gsap/Draggable";
import html2canvas from 'html2canvas';
import debouncer from './debouncer'

import './style.scss'

gsap.registerPlugin(Draggable);

// Reusable Modal Hook
function ModalHook(modalContainerElement) {
  let isOpen = false
  modalContainerElement.querySelectorAll('.modal__close_button').forEach(button => {
    button.addEventListener('click', () => {
      toggle(false)
    })
  })
  const toggle = (force) => {
    if (force === isOpen) return
    if (isOpen) {
      gsap.to(modalContainerElement, {
        duration: 0.3,
        top: '-100%',
        opacity: 0,
        pointerEvents: 'none',
      })
      isOpen = false
    } else {
      gsap.to(modalContainerElement, {
        duration: 0.3,
        top: '10%',
        opacity: 1,
        pointerEvents: 'all',
      })
      isOpen = true
    }
  }

  return toggle
}


// Hook Modal Form
const toggleSaveModal = ModalHook(document.querySelector('#save-modal'))

// Logo Manager as Singleton
const LogoManager = (function() {
  const LogoManagerClass = () => {
    const element = {
      boundaryDraggableArea: document.getElementById('app'),
      colorPaletteContainer: document.getElementById('color-pallete-container'),
      generatedTextContainer: document.getElementById('generated-text'),
      logoTextInput: document.getElementById('logo-text-input'),
      sizeInput: document.getElementById('size-input'),
      sizeText: document.getElementById('size-text'),
      progressIcon: document.getElementById('progress-icon'),
      charsContainer: document.querySelector('#generated-text .chars-container'),
      btnSave: document.getElementById('btn-save'),
      canvasSaveTarget: document.querySelector('#save-modal .modal__content'),
    }
    const colorPalette = [
      '#FE4A49',
      '#2AB7CA',
      '#FED866',
      '#E6E6EA',
      '#F4F4F8'
    ]
    const initialTranslateYValue = 40 
  
    // State
    const colorSelectorElement = []
    let state = {
      color: colorPalette[0],
      size: 26,
      text: 'MetaPals Awesome',
    }
    let summoned = false

    // Re-summon / summon logo to container
    function addLogo(props, zigzag = false) {
      const { text, size, color } = props
      // Summon
      for (let i = 0 ; i < text.length ; i++) {
        const char = text[i]
        const charItem = document.createElement('span')
        charItem.innerHTML = char === ' ' ? '&nbsp;' : char
        charItem.style.color = color
        charItem.style.fontSize = `${size}px`
        charItem.style.opacity = 0
        charItem.style.touchAction = 'none'
        charItem.style.userSelect = 'none'
        charItem.style.cursor = 'grab'
        charItem.style.display = 'inline-block'
        charItem.style.zIndex = '1006'
        charItem.style.fontWeight = '800'
        let translateYValue = initialTranslateYValue
        if (zigzag) {
          if ( i % 2 === 0 ) translateYValue -= 10
          else translateYValue += 10
        }
        charItem.style.transform = `translateY(${translateYValue}px)`
        element.charsContainer.appendChild(charItem)
        Draggable.create(charItem, {
          type: 'x,y',
        })
      }
      gsap.to(element.charsContainer.querySelectorAll('span'), {
        duration: 0.5,
        opacity: 1,
        translateY: initialTranslateYValue,
      })
    }

    // Summon Logo in General
    function summonLogo(props, reset = true) {
      let tl = gsap.timeline()
      if (reset && summoned) {
        tl.to(element.charsContainer.querySelectorAll('span'), {
          duration: 0.5,
          opacity: 0,
          onComplete: () => {
            element.charsContainer.innerHTML = ''
            addLogo(props, true)
          }
        })
      } else {
        addLogo(props, true)
      }

      tl.to(element.charsContainer.querySelectorAll('span'), {
        duration: 0.5,
        opacity: 1,
      })
      tl;
      summoned = true
    }

    // Update Logo Style
    function updateLogoStyle(props) {
      const { size, color } = props
      element.charsContainer.querySelectorAll('span').forEach(span => {
        span.style.color = color
        span.style.fontSize = `${size}px`
      })
    }

    // State Modifier Functions
    function setState(newState) {
      state = {
        ...state,
        ...newState,
      }
      if (newState?.text) summonLogo(state, true)
      else updateLogoStyle(state)
    }
  
    // Insert Color Selector
    function generateColorSelector() {
      for( let i = 0 ; i < colorPalette.length ; i++ ) {
        const color = colorPalette[i]
        const colorPaletteItem = document.createElement('button')
        colorSelectorElement.push(colorPaletteItem)
        colorPaletteItem.className = 'w-12 h-12 rounded-lg border-4 border-white'
        colorPaletteItem.style.backgroundColor = color
        element.colorPaletteContainer.appendChild(colorPaletteItem)
        colorPaletteItem.onclick = (e) => {
          setState({ color })
          e.target.classList.add('border-[olivedrab]')
          e.target.classList.remove('border-white')
          colorSelectorElement.forEach(item => {
            if( item !== e.target ) {
              item.classList.remove('border-[olivedrab]')
              item.classList.add('border-white')
            }
          })
        }
        if ( color === state.color ) {
          colorPaletteItem.click()
        }
      }
    }

    // Hook Logo Text Input
    function hookLogoTextInput() {
      element.logoTextInput.value = state.text
      element.logoTextInput.onkeyup = debouncer({
        onStart: (e) => {
          element.progressIcon.classList.add('animate-ping')
        },
        onEnd: (e) => {
          element.progressIcon.classList.remove('animate-ping')
          setState({ text: e.target.value })
        },
      })
    }

    // Hook Size Input
    function hookSizeInput() {
      element.sizeInput.value = state.size
      element.sizeText.innerText = state.size + 'px'
      element.sizeInput.oninput = (e) => {
        setState({ size: e.target.value })
        element.sizeText.innerText = e.target.value + 'px'
      }
    }

    // Save Image to Canvas
    function saveImage() {
      html2canvas(element.generatedTextContainer).then(canvas => {
        element.canvasSaveTarget.innerHTML = ''
        element.canvasSaveTarget.appendChild(canvas)
        toggleSaveModal(true)
      })
    }

    // Hook Save Button
    function hookSaveButton() {
      element.btnSave.onclick = saveImage
    }
  
    // Init
    hookLogoTextInput()
    hookSizeInput()
    generateColorSelector()
    summonLogo(state)
    hookSaveButton()
  }

  let instance;
  return {
    getInstance: function(){
      if (instance == null) {
        instance = LogoManagerClass();
      }
      return instance;
    }
  }
})();

// Generate Logo Manager Instance at least once
const logoManager = LogoManager.getInstance()
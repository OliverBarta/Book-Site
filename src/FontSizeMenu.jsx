import { useState, useEffect, useRef } from 'react';
import './FontSizeMenu.css';

const MIN_SIZE = 12;
const MAX_SIZE = 24;
const DEFAULT_SIZE = 15;

const MIN_LINE_HEIGHT = 1.2;
const MAX_LINE_HEIGHT = 2.2;
const DEFAULT_LINE_HEIGHT = 1.6;

function FontSizeMenu() {
    const [open, setOpen] = useState(false);
    const [fontSize, setFontSize] = useState(DEFAULT_SIZE);
    const [lineHeight, setLineHeight] = useState(DEFAULT_LINE_HEIGHT);
    const containerRef = useRef(null);

    useEffect(() => {
        const savedFont = localStorage.getItem('p-font-size');
        const savedLineHeight = localStorage.getItem('p-line-height');

        if (savedFont) {
            const parsed = Number(savedFont);
            setFontSize(parsed);
            document.documentElement.style.setProperty('--p-font', `${parsed}px`);
        }
        if (savedLineHeight) {
            const parsed = Number(savedLineHeight);
            setLineHeight(parsed);
            document.documentElement.style.setProperty('--p-line-height', parsed);
        }
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleFontChange(e) {
        const value = Number(e.target.value);
        setFontSize(value);
        document.documentElement.style.setProperty('--p-font', `${value}px`);
        localStorage.setItem('p-font-size', value);
    }

    function handleLineHeightChange(e) {
        const value = Number(e.target.value);
        setLineHeight(value);
        document.documentElement.style.setProperty('--p-line-height', value);
        localStorage.setItem('p-line-height', value);
    }

    return (
        <div className='fontMenuContainer' ref={containerRef}>
            <button onClick={() => setOpen(prev => !prev)} className='fontMenuTrigger'>
                Aa
            </button>

            {open &&
                <div className='fontDropdown'>
                    <span className='fontDropdownLabel'>Text size</span>
                    <div className='fontSliderRow'>
                        <span className='fontSliderIcon small'>A</span>
                        <input type='range' min={MIN_SIZE} max={MAX_SIZE} step={1}
                            value={fontSize} onChange={handleFontChange} className='fontSlider' />
                        <span className='fontSliderIcon large'>A</span>
                    </div>
                    <span className='fontSizeValue'>{fontSize}px</span>

                    <span className='fontDropdownLabel'>Line spacing</span>
                    <div className='fontSliderRow'>
                        <span className='fontSliderIcon small'>☰</span>
                        <input type='range' min={MIN_LINE_HEIGHT} max={MAX_LINE_HEIGHT} step={0.1}
                            value={lineHeight} onChange={handleLineHeightChange} className='fontSlider' />
                        <span className='fontSliderIcon large' style={{ letterSpacing: '2px' }}>☰</span>
                    </div>
                    <span className='fontSizeValue'>{lineHeight.toFixed(1)}</span>
                </div>
            }
        </div>
    );
}

export default FontSizeMenu;
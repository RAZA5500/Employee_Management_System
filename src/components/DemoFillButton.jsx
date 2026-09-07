import { useEffect, useRef, useState } from 'react'
import { CheckIcon, SparklesIcon } from 'lucide-react'

/**
 * One-tap "try the demo" button for the login screens: fills the form with the
 * published test credentials for that portal and flips to a short confirmation.
 */
const DemoFillButton = ({ label, email, onFill, disabled }) => {

    const [filled, setFilled] = useState(false)
    const resetTimer = useRef(null)

    // don't set state on an unmounted form (login navigates away on success)
    useEffect(() => () => clearTimeout(resetTimer.current), [])

    const handleClick = () => {
        onFill()
        setFilled(true)
        clearTimeout(resetTimer.current)
        resetTimer.current = setTimeout(() => setFilled(false), 2500)
    }

    return (
        <button
            type='button'
            onClick={handleClick}
            disabled={disabled}
            aria-label={`Fill in the demo ${label} credentials`}
            className={`group w-full flex items-center gap-3 p-3 rounded-xl border border-dashed text-left transition-all duration-300 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none ${
                filled
                    ? 'border-emerald-300 bg-emerald-50/70'
                    : 'border-indigo-200 bg-linear-to-r from-indigo-50/70 to-white hover:border-indigo-400 hover:from-indigo-50 hover:shadow-md hover:shadow-indigo-500/10'
            }`}
        >
            <span className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-white shadow-sm ring-1 transition-transform duration-300 group-hover:scale-105 ${
                filled ? 'text-emerald-600 ring-emerald-100' : 'text-indigo-600 ring-indigo-100'
            }`}>
                {filled
                    ? <CheckIcon size={16} />
                    : <SparklesIcon size={16} className='transition-transform duration-300 group-hover:rotate-12' />}
            </span>

            <span className='min-w-0'>
                <span className='block text-sm font-medium text-slate-800'>
                    {filled ? 'Filled in — just hit sign in' : `Use the demo ${label} account`}
                </span>
                <span className='block text-xs text-slate-500 truncate'>
                    {filled ? 'Shared test account, no signup needed' : `${email} · ••••••••`}
                </span>
            </span>
        </button>
    )
}

export default DemoFillButton

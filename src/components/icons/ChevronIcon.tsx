export type ChevronIconProps = {
    direction: 'up' | 'down'
}

export const ChevronIcon = ({direction} : ChevronIconProps) => {
    if(direction === 'down') {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M13.2374 14.9203L18.5303 9.6274L17.4696 8.56674L12.1767 13.8596C12.0791 13.9573 11.9208 13.9573 11.8232 13.8596L6.53026 8.56674L5.4696 9.6274L10.7625 14.9203C11.4459 15.6037 12.5539 15.6037 13.2374 14.9203Z" fill="#45423F"/>
            </svg>
        )
    }
    else {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.7625 9.0793L5.4696 14.3722L6.53026 15.4329L11.8232 10.14C11.9208 10.0423 12.0791 10.0423 12.1767 10.14L17.4696 15.4329L18.5303 14.3722L13.2374 9.0793C12.5539 8.39589 11.4459 8.39589 10.7625 9.0793Z" fill="#1D1C1B"/>
            </svg>
        )
    }
}
import React from 'react'
import styles from './Header.module.css'
import { HeaderProps } from '../../../types'

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    backButton,
    actions = [],
    children,
    className = ''
}) => {
    const getButtonClass = (type: string = 'primary') => {
        switch (type) {
            case 'outline':
                return styles.btnOutline;
            case 'danger':
                return styles.btnDanger;
            case 'primary':
            default:
                return styles.btnPrimary;
        }
    };

  return (
    <>
        <header className={`${styles.contentHeader} ${className}`}>
            <nav className={styles.headerLeft}>
                {
                    backButton && (
                        <button
                            type="button"
                            className={styles.btnBack}
                            onClick={backButton.onClick || (() => window.history.back())}
                            title='Go Back'
                        >
                            {backButton.icon}
                        </button>
                    )
                }
                <section className={styles.titleSection}>
                    <h1 className={styles.contentTitle}>{title}</h1>
                    {subtitle && <p className={styles.contentSubtitle}>{subtitle}</p>}
                </section>
            </nav>

            {
                actions.length > 0 && (
                    <section className={styles.contentActions} role='toolbar' aria-label='Page actions'>
                        {
                            actions.map((action: any, index: string) => (
                                <button
                                    key={action.id || index}
                                    type="button"
                                    className={`${getButtonClass(action.type)} ${action.className || ''}`}
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                >
                                    <span>{action.icon && action.icon}</span>
                                    <span>{action.label}</span>
                                </button>
                            ))
                        }
                    </section>
                )
            }
        </header>

        {
            children && (
                <aside className={styles.headerExtras} role='complementary'>
                    {children}
                </aside>
            )
        }
    </>
  ) 
}

export default Header
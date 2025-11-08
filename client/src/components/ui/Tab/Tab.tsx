import styles from './Tab.module.css'

interface TabItem {
    key: string
    label: string
    count?: number
}

interface TabProps {
    tabs: TabItem[]
    activeTab: string
    onTabChange: (key: string) => void
    className?: string
}

const Tab = ({ tabs, activeTab, onTabChange, className = '' }: TabProps) => {
  return (
    <div className={`${styles.tabsContainer} ${className}`}>
        {
            tabs.map((tab) => (
                <button
                    key={tab.key}
                    type="button"
                    className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
                    onClick={() => onTabChange(tab.key)}
                >
                    {tab.label}
                    {
                        tab.count !== undefined && (
                            <span className={styles.tabCount}>{tab.count}</span>
                        )
                    }
                </button>
            ))
        }
    </div>
  )
}

export default Tab
/**
 * Data Mode Context
 * 
 * 提供全局数据模式管理：
 * - Mock 数据模式：对接原有整套 API
 * - 惠达供应链大脑模式：对接新的惠达数据 API
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { setCurrentEnvironment } from '../config/apiConfig';

// ============================================================================
// Types
// ============================================================================

export type DataMode = 'api' | 'mock';

interface DataModeContextType {
    mode: DataMode;
    setMode: (mode: DataMode) => void;
    isApiMode: boolean;
    isMockMode: boolean;
}

// ============================================================================
// Context
// ============================================================================

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface DataModeProviderProps {
    children: ReactNode;
}

const STORAGE_KEY = 'supply-chain-data-mode';

export const DataModeProvider = ({ children }: DataModeProviderProps) => {
    // Initialize from localStorage, default to 'api' (惠达供应链大脑 - 新的惠达数据 API)
    const [mode, setModeState] = useState<DataMode>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return (stored === 'api' || stored === 'mock') ? stored : 'api';
        } catch (error) {
            console.warn('[DataModeContext] Failed to read from localStorage:', error);
            return 'api';
        }
    });

    // Log initial mode on mount
    useEffect(() => {
        console.log(`[DataModeContext] Initialized with mode: ${mode}`);
        // Sync with apiConfig on init
        const apiEnv = mode === 'api' ? 'huida-new' : 'huida-legacy';
        setCurrentEnvironment(apiEnv);
    }, []);

    // Persist mode changes to localStorage
    const setMode = (newMode: DataMode) => {
        try {
            localStorage.setItem(STORAGE_KEY, newMode);
            setModeState(newMode);

            // Sync with apiConfig
            const apiEnv = newMode === 'api' ? 'huida-new' : 'huida-legacy';
            setCurrentEnvironment(apiEnv);

            console.log(`[DataModeContext] Mode switched to: ${newMode} (Environment: ${apiEnv})`);
        } catch (error) {
            console.error('[DataModeContext] Failed to save to localStorage:', error);
            setModeState(newMode); // Still update state even if storage fails
        }
    };

    const value: DataModeContextType = {
        mode,
        setMode,
        isApiMode: mode === 'api',
        isMockMode: mode === 'mock',
    };

    return (
        <DataModeContext.Provider value={value}>
            {children}
        </DataModeContext.Provider>
    );
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access and control the global data mode
 * 
 * @example
 * const { mode, setMode, isApiMode } = useDataMode();
 * 
 * // 切换到惠达供应链大脑模式（新的惠达数据 API）
 * setMode('api');
 * 
 * // 切换到 Mock 数据模式（原有整套 API）
 * setMode('mock');
 * 
 * // 检查当前模式
 * if (isApiMode) {
 *   // 使用新的惠达数据 API
 * } else {
 *   // 使用原有整套 API
 * }
 */
export const useDataMode = (): DataModeContextType => {
    const context = useContext(DataModeContext);

    if (context === undefined) {
        throw new Error('useDataMode must be used within a DataModeProvider');
    }

    return context;
};

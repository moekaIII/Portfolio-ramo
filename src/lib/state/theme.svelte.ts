export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

/** <html data-theme> と同期するテーマ状態（app.html のインラインスクリプトで初期化済み） */
class ThemeState {
	current = $state<Theme>('dark');

	/** クライアントでマウント時に一度呼ぶ */
	init() {
		this.current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
	}

	set(theme: Theme) {
		this.current = theme;
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			/* storage unavailable (private mode etc.) */
		}
	}

	toggle() {
		this.set(this.current === 'dark' ? 'light' : 'dark');
	}
}

export const theme = new ThemeState();

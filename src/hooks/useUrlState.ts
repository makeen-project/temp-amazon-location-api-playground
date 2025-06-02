import { useQueryStates } from "nuqs";

export interface UseUrlStateOptions<T extends object> {
	defaultValue: T;
	paramName?: string;
}

export function useUrlState<T extends object>(options: UseUrlStateOptions<T>) {
	const { defaultValue, paramName = "state" } = options;

	const [state, setState] = useQueryStates({
		[paramName]: {
			defaultValue,
			parse: (value: string) => {
				try {
					return JSON.parse(value) as T;
				} catch {
					return defaultValue;
				}
			},
			serialize: (value: T) => JSON.stringify(value)
		}
	});

	const getShareableUrl = () => {
		return window.location.href;
	};

	return {
		urlState: state[paramName],
		setUrlState: (newState: T) => {
			setState({ [paramName]: newState });
		},
		shareableUrl: getShareableUrl()
	};
}

export interface IUser {
	email: string;
	password: string;
	isActivated: boolean;
	activationLink: string;
}

export interface AuthResponse extends ITokens {
	user: IUser;
}

export interface LogoutResponse {
	user: string;
	refreshToken: string;
}

export interface ITokens {
	accessToken: string;
	refreshToken: string;
}


export interface JwtPayload {
  userId: string;
  email?: string;
  iat: number; 
  exp: number; 
  nickname: string;
  roles?: string[];
  avatar:string;
  language:string;
  timezone:string;
}

export interface UserInfo{
    id:string;
    nickname: string;
    email: string;
    roles?: string[];
    avatar:string;
}
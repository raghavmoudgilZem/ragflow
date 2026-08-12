import { useEffect } from "react";
import { Box, Typography, Link, FormControlLabel, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { CustomInput } from '@shared/components/UI/CustomInput';
import { CustomButton } from '@shared/components/UI/CustomButton';
import { useLogin } from '../hooks/useLogin';
import { useAuthStore } from '../store/useAuthStore';

export const LoginPage = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const {
    formData,
    errors,
    isLoading,
    apiError,
    isSignUp,
    handleInputChange,
    submitForm,
    toggleViewMode
  } = useLogin();

  useEffect(() => {
    if (user) {
      navigate(ROUTES.HOME);
    }
  }, [user, navigate]);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#141416",
        backgroundImage: `
          radial-gradient(circle at 10% -15%, rgba(128, 255, 248, 0.2) 0%, rgba(128, 255, 248, 0) 15%),
          radial-gradient(circle at 90% -17%, rgba(128, 255, 248, 0.3) 0%, rgba(128, 255, 248, 0) 15%),
          radial-gradient(circle at 50% 190%, rgba(128, 255, 248, 0.3) 0%, rgba(128, 255, 248, 0) 60%)
        `,
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1
        }}
      >
        <path
          d="M 0,0 C 300,10 600,230 960,180 C 1310,230 1510,10 1620,0"
          fill="none"
          stroke="rgba(128, 255, 248, 0.08)"
          strokeWidth="1.5"
        />

        <path
          d="M 0,80 C 200,220 650,490 960,490 C 1270,490 1520,320 1920,120"
          fill="none"
          stroke="rgba(128, 255, 248, 0.04)"
          strokeWidth="1.5"
        />

        <path
          d="M 0,250 C 400,600 700,720 960,720 C 1220,720 1520,600 1920,350"
          fill="none"
          stroke="rgba(128, 255, 248, 0.04)"
          strokeWidth="1.5"
        />
      </Box>

      <Box sx={{ padding: "24px 40px", display: "flex", alignItems: "center", mt: "30px", zIndex: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Box component="img" src="/logo.svg" alt="RAGFlow Logo" sx={{ width: "32px", height: "34px", margin: "6px" }} />
          <Typography sx={{ fontWeight: 700, color: "#ffffff", fontSize: "1.25rem", lineHeight: "1.75rem" }}>
            RAGFlow
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pb: "80px", zIndex: 2 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: "36px",
            fontWeight: 500,
            mb: "111px",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            textAlign: "center",
            color: "#ffffff"
          }}
        >
          A leading RAG engine for LLM context
        </Typography>

        <Box sx={{ perspective: "1500px", width: "100%", maxWidth: "540px", minHeight: "580px", position: "relative" }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isSignUp ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >

            {/* FRONT PANEL: SIGN IN */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                backfaceVisibility: "hidden",
                zIndex: 2,
                transform: "rotateY(0deg)",
                display: isSignUp ? "none" : "block"
              }}
            >
              <Typography variant="h5" component="h2" sx={{ fontSize: "1.25rem", lineHeight: "1.75rem", color: "#ffffff", mb: "24px", letterSpacing: "0.3px", textAlign: "center" }}>
                Sign in to your account
              </Typography>

              <Box
                component="form"
                onSubmit={submitForm}
                noValidate
                sx={{
                  width: "100%",
                  maxWidth: "540px",
                  bgcolor: "rgb(30 32 37 / 78%)",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                  borderRadius: "15px",
                  padding: "40px 40px 0 40px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(10px)"
                }}
              >
                {apiError && !isSignUp && (
                  <Box sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "6px", p: "12px", fontSize: "13px", color: "#ef4444", mb: "20px", textAlign: "left", lineHeight: 1.4 }}>
                    {apiError}
                  </Box>
                )}

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography component="label" htmlFor="login-email" sx={{ fontSize: "14px", mb: "8px", color: "#94a3b8", fontWeight: 500 }}>
                    <Box component="span" sx={{ color: "#ef4444", mr: "4px" }}>*</Box>Email
                  </Typography>
                  <CustomInput
                    id="login-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                    placeholder="Please input email"
                  />
                  <Box sx={{ minHeight: "14px", mt: "4px", mb: "10px" }}>
                    {errors.email && <Typography sx={{ color: "#ef4444", fontSize: "12px", fontWeight: 500 }}>{errors.email}</Typography>}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography component="label" htmlFor="login-password" sx={{ fontSize: "14px", mb: "8px", color: "#94a3b8", fontWeight: 500 }}>
                    <Box component="span" sx={{ color: "#ef4444", mr: "4px" }}>*</Box>Password
                  </Typography>
                  <CustomInput
                    id="login-password"
                    name="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={handleInputChange}
                    error={errors.password}
                    required
                    placeholder="Please input password"
                  />
                  <Box sx={{ minHeight: "14px", mt: "4px", mb: "10px" }}>
                    {errors.password && <Typography sx={{ color: "#ef4444", fontSize: "12px", fontWeight: 500 }}>{errors.password}</Typography>}
                  </Box>
                </Box>

                <Box sx={{ mb: "17px", mt: "4px" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        disableRipple
                        icon={<Box sx={{ width: 18, height: 18, border: '1px solid rgba(255,255,255,0.15)', borderRadius: '3px', bgcolor: 'rgba(255,255,255,0.04)' }} />}
                        checkedIcon={
                          <Box sx={{ width: 18, height: 18, border: '1px solid rgba(255,255,255,0.4)', borderRadius: '3px', bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box sx={{ width: 8, height: 4, borderLeft: '2px solid #ffffff', borderBottom: '2px solid #ffffff', transform: 'rotate(-45deg) translate(0.5px, -0.5px)' }} />
                          </Box>
                        }
                        sx={{ p: 0, mr: "8px" }}
                      />
                    }
                    label={<Typography sx={{ color: "#94a3b8", fontSize: "14px", userSelect: "none" }}>Remember me</Typography>}
                    sx={{ m: 0, gap: "8px", alignItems: "center" }}
                  />
                </Box>

                <CustomButton type="submit" isLoading={isLoading} sx={{ mt: "32px !important" }}>
                  Sign in
                </CustomButton>

                <Typography sx={{ textAlign: "right", color: "#94a3b8", mt: "45px", fontSize: "14px", pb: "40px" }}>
                  Don't have an account?{" "}
                  <Link href="#signup" onClick={toggleViewMode} sx={{ color: "#00beb4", textDecoration: "none", fontWeight: 500, "&:hover": { textDecoration: "underline" } }}>
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>

            {/* BACK PANEL: CREATE ACCOUNT */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                display: isSignUp ? "block" : "none"
              }}
            >
              <Typography variant="h5" component="h2" sx={{ fontSize: "1.25rem", lineHeight: "1.75rem", color: "#ffffff", mb: "24px", letterSpacing: "0.3px", textAlign: "center" }}>
                Create an account
              </Typography>

              <Box
                component="form"
                onSubmit={submitForm}
                noValidate
                sx={{
                  width: "100%",
                  maxWidth: "540px",
                  bgcolor: "rgb(30 32 37 / 78%)",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                  borderRadius: "15px",
                  padding: "40px 40px 0 40px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(10px)"
                }}
              >
                {apiError && isSignUp && (
                  <Box sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "6px", p: "12px", fontSize: "13px", color: "#ef4444", mb: "20px", textAlign: "left", lineHeight: 1.4 }}>
                    {apiError}
                  </Box>
                )}

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography component="label" htmlFor="signup-email" sx={{ fontSize: "14px", mb: "8px", color: "#94a3b8", fontWeight: 500 }}>
                    <Box component="span" sx={{ color: "#ef4444", mr: "4px" }}>*</Box>Email
                  </Typography>
                  <CustomInput
                    id="signup-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                    placeholder="Please input email"
                  />
                  <Box sx={{ minHeight: "14px", mt: "4px", mb: "10px" }}>
                    {errors.email && <Typography sx={{ color: "#ef4444", fontSize: "12px", fontWeight: 500 }}>{errors.email}</Typography>}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography component="label" htmlFor="signup-nickname" sx={{ fontSize: "14px", mb: "8px", color: "#94a3b8", fontWeight: 500 }}>
                    <Box component="span" sx={{ color: "#ef4444", mr: "4px" }}>*</Box>Nickname
                  </Typography>
                  <CustomInput
                    id="signup-nickname"
                    name="nickname"
                    type="text"
                    value={formData.nickname || ''}
                    onChange={handleInputChange}
                    error={errors.nickname}
                    required
                    placeholder="Please input nickname"
                  />
                  <Box sx={{ minHeight: "14px", mt: "4px", mb: "10px" }}>
                    {errors.nickname && <Typography sx={{ color: "#ef4444", fontSize: "12px", fontWeight: 500 }}>{errors.nickname}</Typography>}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography component="label" htmlFor="signup-password" sx={{ fontSize: "14px", mb: "8px", color: "#94a3b8", fontWeight: 500 }}>
                    <Box component="span" sx={{ color: "#ef4444", mr: "4px" }}>*</Box>Password
                  </Typography>
                  <CustomInput
                    id="signup-password"
                    name="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={handleInputChange}
                    error={errors.password}
                    required
                    placeholder="Please input password"
                  />
                  <Box sx={{ minHeight: "14px", mt: "4px", mb: "10px" }}>
                    {errors.password && <Typography sx={{ color: "#ef4444", fontSize: "12px", fontWeight: 500 }}>{errors.password}</Typography>}
                  </Box>
                </Box>

                <CustomButton type="submit" isLoading={isLoading} sx={{ mt: "32px !important" }}>
                  Continue
                </CustomButton>

                <Typography sx={{ textAlign: "right", color: "#94a3b8", mt: "45px", fontSize: "14px", pb: "40px" }}>
                  Already have an account?{" "}
                  <Link href="#signin" onClick={toggleViewMode} sx={{ color: "#00beb4", textDecoration: "none", fontWeight: 500, "&:hover": { textDecoration: "underline" } }}>
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
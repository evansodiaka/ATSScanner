import React, { useState, useEffect, useCallback } from "react";
import authService from "../services/authService";
import { LoginFormData, RegisterFormData } from "../types/user";
import { GoogleCredentialResponse } from "../types/google";
import {
  MDBContainer,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox,
} from "mdb-react-ui-kit";

const Login: React.FC = () => {
  const [justifyActive, setJustifyActive] = useState<"tab1" | "tab2">("tab1");

  // Password visibility state
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] =
    useState<boolean>(false);

  // Toggle password visibility functions
  const toggleLoginPasswordVisibility = (): void => {
    setShowLoginPassword(!showLoginPassword);
  };

  const toggleRegisterPasswordVisibility = (): void => {
    setShowRegisterPassword(!showRegisterPassword);
  };

  const handleJustifyClick = (value: "tab1" | "tab2"): void => {
    if (value === justifyActive) return;
    setJustifyActive(value);
  };

  // Handle Google credential response
  const handleGoogleResponse = useCallback(
    async (response: GoogleCredentialResponse): Promise<void> => {
      try {
        await authService.googleAuth(response.credential);
        window.location.reload(); // Force refresh to update App state
      } catch (error) {
        console.error("Google authentication failed:", error);
        alert("Google Sign-In failed. Please try again.");
      }
    },
    [],
  );

  // Initialize Google Identity Services
  useEffect(() => {
    const initializeGoogleAuth = () => {
      console.log("Attempting to initialize Google Auth...");
      console.log("window.google available:", !!window.google);
      console.log(
        "window.google.accounts available:",
        !!window.google?.accounts,
      );
      console.log(
        "window.google.accounts.id available:",
        !!window.google?.accounts?.id,
      );

      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            // Using fresh OAuth client ID for immediate functionality
            client_id:
              "1075791096679-0kk6dkm4hfcns15kvh7nqkcllritibdg.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          console.log("Google Identity Services initialized successfully");
        } catch (error) {
          console.error("Error initializing Google Identity Services:", error);
        }
      } else {
        console.log("Google Identity Services not ready, retrying...");
        // Wait for Google script to load
        setTimeout(initializeGoogleAuth, 100);
      }
    };

    // Add a delay to ensure DOM is ready
    setTimeout(() => {
      initializeGoogleAuth();
    }, 500);
  }, [handleGoogleResponse]);

  // Render Google button as fallback
  useEffect(() => {
    if (window.google?.accounts?.id) {
      // Try to render a button as fallback
      const buttonContainer = document.getElementById("google-signin-fallback");
      if (buttonContainer) {
        try {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: "outline",
            size: "large",
            text: "sign_in_with",
            width: 200,
          });
        } catch (error) {
          console.log("Could not render Google button:", error);
        }
      }
    }
  }, []);

  // Handle Login Form Submit
  const handleLoginSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const loginData: LoginFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      await authService.login(loginData.email, loginData.password);
      window.location.reload(); // Force refresh to update App state
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  // Handle Register Form Submit
  const handleRegisterSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const registerData: RegisterFormData = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      await authService.register(
        registerData.username,
        registerData.email,
        registerData.password,
      );
      window.location.reload(); // Force refresh to update App state
    } catch (error) {
      console.error("Registration failed:", error);
      const err: any = error;
      const serverMsg = err?.response?.data || err?.message || "Unknown error";
      alert("Registration failed: " + (typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg)));
    }
  };

  // Test function to verify Google configuration
  const testGoogleConfig = () => {
    console.log("=== GOOGLE CONFIG TEST ===");
    console.log("Current URL:", window.location.origin);
    console.log(
      "Client ID in use:",
      "1075791096679-0kk6dkm4hfcns15kvh7nqkcllritibdg.apps.googleusercontent.com",
    );
    console.log("Google object available:", !!window.google);
    console.log("Full window.location:", window.location.href);
    console.log("========================");
  };

  // Handle Google Sign-In button click
  const handleGoogleSignIn = (): void => {
    testGoogleConfig(); // Add debugging info
    console.log("Google Sign-In button clicked");

    if (window.google?.accounts?.id) {
      try {
        console.log("Creating popup Google Sign-In button...");

        // Create overlay background
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        overlay.style.zIndex = "9998";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";

        // Create popup container
        const popup = document.createElement("div");
        popup.style.position = "relative";
        popup.style.backgroundColor = "white";
        popup.style.padding = "30px";
        popup.style.border = "2px solid #ccc";
        popup.style.borderRadius = "10px";
        popup.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
        popup.style.maxWidth = "400px";
        popup.style.width = "90%";

        // Create close button
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "×";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "10px";
        closeBtn.style.right = "15px";
        closeBtn.style.border = "none";
        closeBtn.style.background = "none";
        closeBtn.style.fontSize = "24px";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.color = "#666";
        closeBtn.style.fontWeight = "bold";
        closeBtn.title = "Close";

        // Create title
        const title = document.createElement("h3");
        title.textContent = "Sign in with Google";
        title.style.margin = "0 0 20px 0";
        title.style.textAlign = "center";
        title.style.color = "#333";

        // Close popup function
        const closePopup = () => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          document.removeEventListener("keydown", handleEscape);
        };

        // Handle escape key
        const handleEscape = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            closePopup();
          }
        };

        // Event listeners
        closeBtn.onclick = closePopup;
        overlay.onclick = (e) => {
          // Close if clicking on overlay (not the popup itself)
          if (e.target === overlay) {
            closePopup();
          }
        };
        document.addEventListener("keydown", handleEscape);

        // Assemble popup
        popup.appendChild(closeBtn);
        popup.appendChild(title);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Render Google button in the popup
        window.google.accounts.id.renderButton(popup, {
          theme: "filled_blue",
          size: "large",
          text: "sign_in_with",
          width: 280,
        });

        // Auto-close popup on successful sign-in
        const originalCallback = handleGoogleResponse;
        const wrappedCallback = async (response: GoogleCredentialResponse) => {
          closePopup(); // Close popup immediately
          await originalCallback(response); // Then handle sign-in
        };

        // Update the callback temporarily for this popup
        window.google.accounts.id.initialize({
          client_id:
            "1075791096679-0kk6dkm4hfcns15kvh7nqkcllritibdg.apps.googleusercontent.com",
          callback: wrappedCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (error) {
        console.error("Error creating Google Sign-In popup:", error);
        alert('Please use the "Sign in with Google" button below instead.');
      }
    } else {
      console.error("Google Identity Services not available");
      alert("Google Identity Services not loaded. Please refresh the page.");
    }
  };

  console.log("Rendering Login component");
  console.log("justifyActive is", justifyActive);

  return (
    <div
      className="homepage-background"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MDBContainer
        className="p-4 d-flex flex-column align-items-center w-100"
        style={{ maxWidth: 600, marginTop: 64, marginBottom: 32 }}
      >
        <MDBTabs
          pills
          justify
          className="mb-4 d-flex flex-row justify-content-between w-100"
          style={{ maxWidth: 400 }}
        >
          <MDBTabsItem>
            <MDBTabsLink
              onClick={() => handleJustifyClick("tab1")}
              active={justifyActive === "tab1"}
            >
              Login
            </MDBTabsLink>
          </MDBTabsItem>
          <MDBTabsItem>
            <MDBTabsLink
              onClick={() => handleJustifyClick("tab2")}
              active={justifyActive === "tab2"}
            >
              Register
            </MDBTabsLink>
          </MDBTabsItem>
        </MDBTabs>

        <MDBTabsContent className="w-100" style={{ maxWidth: 400 }}>
          <MDBTabsPane open={justifyActive === "tab1"}>
            <div className="text-center mb-3">
              <p style={{ color: "white" }}>Sign in with:</p>
              <div
                className="d-flex justify-content-between mx-auto mb-3"
                style={{ width: "100%", maxWidth: 400 }}
              >
                <MDBBtn
                  tag="a"
                  className="m-1 flex-fill"
                  style={{
                    backgroundColor: "#4267B2",
                    color: "white",
                    minWidth: 0,
                    border: "none",
                  }}
                >
                  <MDBIcon fab icon="facebook-f" size="sm" />
                </MDBBtn>
                <MDBBtn
                  tag="a"
                  className="m-1 flex-fill"
                  style={{
                    backgroundColor: "#1DA1F2",
                    color: "white",
                    minWidth: 0,
                    border: "none",
                  }}
                >
                  <MDBIcon fab icon="twitter" size="sm" />
                </MDBBtn>
                <MDBBtn
                  className="m-1 flex-fill"
                  style={{
                    backgroundColor: "#DB4437",
                    color: "white",
                    minWidth: 0,
                    border: "none",
                  }}
                  onClick={handleGoogleSignIn}
                >
                  <MDBIcon fab icon="google" size="sm" />
                </MDBBtn>
                <MDBBtn
                  tag="a"
                  className="m-1 flex-fill"
                  style={{
                    backgroundColor: "#333",
                    color: "white",
                    minWidth: 0,
                    border: "none",
                  }}
                >
                  <MDBIcon fab icon="github" size="sm" />
                </MDBBtn>
              </div>
              <p className="text-center mt-3" style={{ color: "white" }}>
                or:
              </p>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <MDBInput
                wrapperClass="mb-4"
                label="Email address"
                id="login-email"
                name="email"
                type="email"
                style={{
                  minWidth: 0,
                  width: "100%",
                  maxWidth: 400,
                  fontSize: "1rem",
                  height: "40px",
                  color: "white",
                  backgroundColor: "transparent",
                }}
                autoComplete="email"
                className="text-white"
                labelStyle={{ color: "white" }}
              />
              <div
                style={{ position: "relative", maxWidth: 400, width: "100%" }}
              >
                <MDBInput
                  wrapperClass="mb-4"
                  label="Password"
                  id="login-password"
                  name="password"
                  type={showLoginPassword ? "text" : "password"}
                  style={{
                    minWidth: 0,
                    width: "100%",
                    maxWidth: 400,
                    fontSize: "1rem",
                    height: "40px",
                    color: "white",
                    paddingRight: "40px",
                    backgroundColor: "transparent",
                  }}
                  autoComplete="current-password"
                  className="text-white"
                  labelStyle={{ color: "white" }}
                />
                <button
                  type="button"
                  onClick={toggleLoginPasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                    fontSize: "1.1rem",
                    zIndex: 10,
                  }}
                  aria-label={
                    showLoginPassword ? "Hide password" : "Show password"
                  }
                >
                  <MDBIcon fas icon={showLoginPassword ? "eye" : "eye-slash"} />
                </button>
              </div>
              <div
                className="d-flex justify-content-between mx-4 mb-4"
                style={{ maxWidth: 400, width: "100%" }}
              >
                <MDBCheckbox
                  name="login-remember"
                  id="login-remember"
                  label="Remember me"
                  labelStyle={{ color: "white" }}
                />
                <a href="!#" style={{ color: "white" }}>
                  Forgot password?
                </a>
              </div>
              <MDBBtn
                type="submit"
                className="mthb-4 w-100"
                style={{ maxWidth: 400 }}
              >
                Sign in
              </MDBBtn>
            </form>
            <p className="text-center" style={{ color: "white" }}>
              Not a member?{" "}
              <a
                href="#!"
                onClick={() => setJustifyActive("tab2")}
                style={{ color: "white", textDecoration: "underline" }}
              >
                Register
              </a>
            </p>
          </MDBTabsPane>

          <MDBTabsPane open={justifyActive === "tab2"}>
            <div className="text-center mb-3">
              <p style={{ color: "white" }}>Sign up with:</p>
              <div
                className="d-flex justify-content-between mx-auto mb-3"
                style={{ width: "100%", maxWidth: 400 }}
              >
                <MDBBtn
                  tag="a"
                  className="m-1 flex-fill"
                  style={{
                    backgroundColor: "#4267B2",
                    color: "white",
                    minWidth: 0,
                    border: "none",
                  }}
                >
                  <MDBIcon fab icon="facebook-f" size="sm" />
                </MDBBtn>
                <MDBBtn
                  tag="a"
                  className="m-1 flex-fill"
                  style={{
                    backgroundColor: "#1DA1F2",
                    color: "white",
                    minWidth: 0,
                    border: "none",
                  }}
                >
                  <MDBIcon fab icon="twitter" size="sm" />
                </MDBBtn>
                <MDBBtn
                  className="m-1 flex-fill"
                  style={{
                    backgroundColor: "#DB4437",
                    color: "white",
                    minWidth: 0,
                    border: "none",
                  }}
                  onClick={handleGoogleSignIn}
                >
                  <MDBIcon fab icon="google" size="sm" />
                </MDBBtn>
                <MDBBtn
                  tag="a"
                  className="m-1 flex-fill"
                  style={{
                    backgroundColor: "#333",
                    color: "white",
                    minWidth: 0,
                    border: "none",
                  }}
                >
                  <MDBIcon fab icon="github" size="sm" />
                </MDBBtn>
              </div>
              <p className="text-center mt-3" style={{ color: "white" }}>
                or:
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <MDBInput
                wrapperClass="mb-4"
                label="Name"
                id="register-name"
                name="name"
                type="text"
                style={{
                  minWidth: 0,
                  width: "100%",
                  maxWidth: 400,
                  fontSize: "1rem",
                  height: "40px",
                  color: "white",
                  backgroundColor: "transparent",
                }}
                autoComplete="name"
                className="text-white"
                labelStyle={{ color: "white" }}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Username"
                id="register-username"
                name="username"
                type="text"
                style={{
                  minWidth: 0,
                  width: "100%",
                  maxWidth: 400,
                  fontSize: "1rem",
                  height: "40px",
                  color: "white",
                  backgroundColor: "transparent",
                }}
                autoComplete="username"
                className="text-white"
                labelStyle={{ color: "white" }}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Email"
                id="register-email"
                name="email"
                type="email"
                style={{
                  minWidth: 0,
                  width: "100%",
                  maxWidth: 400,
                  fontSize: "1rem",
                  height: "40px",
                  color: "white",
                  backgroundColor: "transparent",
                }}
                autoComplete="email"
                className="text-white"
                labelStyle={{ color: "white" }}
              />
              <div
                style={{ position: "relative", maxWidth: 400, width: "100%" }}
              >
                <MDBInput
                  wrapperClass="mb-4"
                  label="Password"
                  id="register-password"
                  name="password"
                  type={showRegisterPassword ? "text" : "password"}
                  style={{
                    minWidth: 0,
                    width: "100%",
                    maxWidth: 400,
                    fontSize: "1rem",
                    height: "40px",
                    color: "white",
                    paddingRight: "40px",
                    backgroundColor: "transparent",
                  }}
                  autoComplete="new-password"
                  className="text-white"
                  labelStyle={{ color: "white" }}
                />
                <button
                  type="button"
                  onClick={toggleRegisterPasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                    fontSize: "1.1rem",
                    zIndex: 10,
                  }}
                  aria-label={
                    showRegisterPassword ? "Hide password" : "Show password"
                  }
                >
                  <MDBIcon
                    fas
                    icon={showRegisterPassword ? "eye" : "eye-slash"}
                  />
                </button>
              </div>
              <div
                className="d-flex justify-content-center mb-4"
                style={{ maxWidth: 400, width: "100%" }}
              >
                <MDBCheckbox
                  name="register-terms"
                  id="register-terms"
                  label="I have read and agree to the terms"
                  labelStyle={{ color: "white" }}
                />
              </div>
              <MDBBtn
                type="submit"
                className="mb-4 w-100"
                style={{ maxWidth: 400 }}
              >
                Sign up
              </MDBBtn>
            </form>
            <p className="text-center" style={{ color: "white" }}>
              Already have an account?{" "}
              <a
                href="#!"
                onClick={() => setJustifyActive("tab1")}
                style={{ color: "white", textDecoration: "underline" }}
              >
                Login
              </a>
            </p>
          </MDBTabsPane>
        </MDBTabsContent>
      </MDBContainer>
    </div>
  );
};

export default Login;

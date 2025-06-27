import React from "react";
import { useNavigate } from "react-router-dom";
import { MDBContainer, MDBBtn } from "mdb-react-ui-kit";

const Homepage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleScanResume = () => {
    navigate("/login"); // For now, both buttons go to login. Can be changed later.
  };

  return (
    <MDBContainer
      className="p-4 d-flex flex-column align-items-center w-100 text-center"
      style={{
        maxWidth: 800,
        marginTop: 64,
        marginBottom: 32,
        minHeight: "calc(100vh - 64px)",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
        {/* Main Headline */}
        <h1
          style={{
            color: "white",
            fontSize: "3.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            lineHeight: "1.2",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Resumes That Beat the Bots.
          <br />
          Land the Interview.
        </h1>

        {/* Subheadline */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "1.3rem",
            fontWeight: 300,
            marginBottom: "3rem",
            lineHeight: "1.6",
            maxWidth: "600px",
          }}
        >
          Resumetrics helps you create tailored, ATS-optimized resumes that
          stand out in today's automated hiring systems — so your skills get
          seen, and you get the interview.
        </p>

        {/* Call to Action Buttons */}
        <div
          className="d-flex flex-column flex-md-row gap-3 w-100 justify-content-center"
          style={{ maxWidth: "500px" }}
        >
          <MDBBtn
            size="lg"
            className="flex-fill"
            style={{
              backgroundColor: "#4CAF50",
              border: "none",
              fontWeight: 600,
              fontSize: "1.1rem",
              padding: "12px 30px",
              borderRadius: "8px",
              boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
              transition: "all 0.3s ease",
            }}
            onClick={handleGetStarted}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#45a049";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(76, 175, 80, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#4CAF50";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(76, 175, 80, 0.3)";
            }}
          >
            Get Started for Free
          </MDBBtn>

          <MDBBtn
            size="lg"
            outline
            className="flex-fill"
            style={{
              color: "white",
              borderColor: "white",
              borderWidth: "2px",
              fontWeight: 600,
              fontSize: "1.1rem",
              padding: "12px 30px",
              borderRadius: "8px",
              transition: "all 0.3s ease",
            }}
            onClick={handleScanResume}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "#6a11cb";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Scan My Resume
          </MDBBtn>
        </div>

        {/* Additional subtle text */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.9rem",
            marginTop: "2rem",
            fontStyle: "italic",
          }}
        >
          No credit card required • Free forever plan available
        </p>
      </MDBContainer>
  );
};

export default Homepage;

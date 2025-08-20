import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import Route from "./Route";
import Passengers from "./Passengers";
import Confirmation from "./Confirmation";
import SearchFlights from "./SearchFlights";
import ThankYou from "./ThankYou";

type Step = "route" | "passengers" | "confirmation" | "search" | "thankyou";

export default function UserFormPage({ step }: { step?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(
    (step as Step) || "route",
  );

  // Note: Removed authentication requirement to support guest checkout

  useEffect(() => {
    if (step) {
      setCurrentStep(step as Step);
    } else {
      // fallback: try to infer from path
      const path = location.pathname.split("/")[2];
      if (
        path &&
        ["route", "passengers", "confirmation", "search", "thankyou"].includes(
          path,
        )
      ) {
        setCurrentStep(path as Step);
      }
    }
  }, [step, location.pathname]);

  const goToNextStep = () => {
    switch (currentStep) {
      case "route":
        setCurrentStep("passengers");
        break;
      case "passengers":
        setCurrentStep("confirmation");
        break;
      case "confirmation":
        setCurrentStep("search");
        break;
      case "search":
        setCurrentStep("thankyou");
        break;
      default:
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case "passengers":
        setCurrentStep("route");
        break;
      case "confirmation":
        setCurrentStep("passengers");
        break;
      default:
        break;
    }
  };

  const navigateToStep = (step: Step) => {
    setCurrentStep(step);
  };

  return (
    <>
      <Header />
      {(() => {
        switch (currentStep) {
          case "route":
            return (
              <Route
                onNext={goToNextStep}
                currentStep={currentStep}
                onNavigate={navigateToStep}
              />
            );
          case "passengers":
            return (
              <Passengers
                onNext={goToNextStep}
                onBack={goToPreviousStep}
                currentStep={currentStep}
                onNavigate={navigateToStep}
              />
            );
          case "confirmation":
            return (
              <Confirmation
                onNext={goToNextStep}
                onBack={goToPreviousStep}
                currentStep={currentStep}
                onNavigate={navigateToStep}
              />
            );
          case "search":
            return <SearchFlights onNext={goToNextStep} />;
          case "thankyou":
            return <ThankYou />;
          default:
            return (
              <Route
                onNext={goToNextStep}
                currentStep={currentStep}
                onNavigate={navigateToStep}
              />
            );
        }
      })()}
    </>
  );
}

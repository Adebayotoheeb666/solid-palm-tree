// Simple auth test
const testLogin = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "onboard@admin.com",
        password: "onboardadmin",
      }),
    });

    const result = await response.json();
    console.log("Auth Test Result:", {
      success: result.success,
      hasUser: !!result.user,
      hasToken: !!result.token,
      message: result.message,
    });

    return result;
  } catch (error) {
    console.error("Auth test failed:", error);
    return null;
  }
};

testLogin();

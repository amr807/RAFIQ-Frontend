import React from "react";

const HeroTitle = React.memo(() => {
  return (<>
    <h1 className="text-4xl font-sans  tracking-tight text-gray-900 sm:text-6xl">
      Employee Management <span className="text-primary">Made Simple</span>
    </h1>
     <p className="mt-6 font-sans  text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
     Streamline your workforce management with our comprehensive  system.
     Track attendance, performance, and productivity in one place.
   </p></>
  );
});

HeroTitle.displayName = "HeroTitle";

export default HeroTitle;

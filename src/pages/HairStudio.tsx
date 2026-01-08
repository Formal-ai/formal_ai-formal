import StudioPageLayout, { StudioSelect } from "@/components/StudioPageLayout";
import { HAIR_OPTIONS } from "@/data/studioOptions";

const HairStudio = () => {
  return (
    <StudioPageLayout
      title="Hair Studio"
      subtitle="Experiment with different hairstyles and grooming options."
      studioType="Hair"
    >
      {({ genderMode, selections, handleSelectionChange }) => {
        if (genderMode === "Gentlemen") {
          const options = HAIR_OPTIONS.Gentlemen;
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StudioSelect
                label="Hair Type"
                options={options.hairType}
                value={selections.hairType}
                onChange={(v) => handleSelectionChange("hairType", v)}
              />
              <StudioSelect
                label="Beard / Grooming"
                options={options.beardGrooming}
                value={selections.beardGrooming}
                onChange={(v) => handleSelectionChange("beardGrooming", v)}
              />
              <StudioSelect
                label="Hair Finish"
                options={options.hairFinish}
                value={selections.hairFinish}
                onChange={(v) => handleSelectionChange("hairFinish", v)}
              />
            </div>
          );
        }

        // Ladies options
        const options = HAIR_OPTIONS.Ladies;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StudioSelect
              label="Hair Type"
              options={options.hairType}
              value={selections.hairType}
              onChange={(v) => handleSelectionChange("hairType", v)}
            />
            <StudioSelect
              label="Hairstyle"
              options={options.hairstyle}
              value={selections.hairstyle}
              onChange={(v) => handleSelectionChange("hairstyle", v)}
            />
            <StudioSelect
              label="Hair Finish"
              options={options.hairFinish}
              value={selections.hairFinish}
              onChange={(v) => handleSelectionChange("hairFinish", v)}
            />
          </div>
        );
      }}
    </StudioPageLayout>
  );
};

export default HairStudio;

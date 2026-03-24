import { CustomFurnitureConfigurator } from "@/components/configurator/custom-furniture-configurator";
import { Providers } from "@/components/providers";

export default function ConfiguratorPage() {
  return (
    <Providers>
      <CustomFurnitureConfigurator />
    </Providers>
  );
}

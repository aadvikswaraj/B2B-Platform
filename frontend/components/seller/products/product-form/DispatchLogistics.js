import { Input, Textarea } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Controller } from "react-hook-form";
import TieredInput from "@/components/ui/TieredInput";

export default function DispatchLogistics({
  register,
  control,
  errors,
  parcelMode,
  setParcelMode,
  freightMode,
  setFreightMode,
  hideDetails = false,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
        <strong>How it works:</strong> Small orders go via Courier (Parcel).
        Large orders (bulk/pallets) go via Transport (Freight).
      </div>
      {/* Parcel Dispatch Time */}
      <Controller
        control={control}
        name="dispatchTimeParcelSlabs"
        defaultValue={[]}
        render={({ field: { value, onChange } }) => (
          <TieredInput
            title="Dispatch Time (Parcel)"
            description="Set standard dispatch time or volume-based timeline for small orders."
            mode={parcelMode}
            onModeChange={setParcelMode}
            orderBy="maxQty"
            singleLabel="Flat Days"
            slabLabel="Volume Based"
            renderSingle={
              <FormField
                label="Standard Time"
                error={errors.dispatchTimeParcel?.message}
                required={true}
                className="mb-0"
              >
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    {...register("dispatchTimeParcel", { min: 0 })}
                    placeholder="e.g. 2"
                  />
                  <span className="text-sm text-gray-500">Days</span>
                </div>
              </FormField>
            }
            value={value || []}
            onChange={onChange}
            columns={[
              {
                key: "maxQty",
                label: "Upto Qty",
                type: "number",
                placeholder: "10",
                required: true,
                min: 1,
              },
              {
                key: "days",
                label: "Days",
                type: "number",
                suffix: " Days",
                required: true,
                min: 0,
              },
            ]}
            defaultSlab={{ maxQty: "", days: "" }}
            showSortButton={true}
            sortButtonLabel="Sort by quantity"
            previewConfig={{
              orderBy: "maxQty",
              label: (slab) => `Upto ${slab.maxQty} units`,
              value: (slab) => `${slab.days} Days`,
            }}
          />
        )}
      />

      {/* Freight Dispatch Time */}
      <Controller
        control={control}
        name="dispatchTimeFreightSlabs"
        defaultValue={[]}
        render={({ field: { value, onChange } }) => (
          <TieredInput
            title="Dispatch Time (Freight)"
            description="Set timeline for bulk/pallet orders."
            mode={freightMode}
            onModeChange={setFreightMode}
            orderBy="maxQty"
            singleLabel="Flat Days"
            slabLabel="Volume Based"
            renderSingle={
              <FormField
                label="Standard Time"
                error={errors.dispatchTimeFreight?.message}
                required={true}
                className="mb-0"
              >
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    {...register("dispatchTimeFreight", { min: 0 })}
                    placeholder="e.g. 7"
                  />
                  <span className="text-sm text-gray-500">Days</span>
                </div>
              </FormField>
            }
            value={value || []}
            onChange={onChange}
            columns={[
              {
                key: "maxQty",
                label: "Upto Qty",
                type: "number",
                placeholder: "100",
                required: true,
                min: 1,
              },
              {
                key: "days",
                label: "Days",
                type: "number",
                suffix: " Days",
                required: true,
                min: 0,
              },
            ]}
            defaultSlab={{ maxQty: "", days: "" }}
            showSortButton={true}
            sortButtonLabel="Sort by quantity"
            previewConfig={{
              orderBy: "maxQty",
              label: (slab) => `Upto ${slab.maxQty} units`,
              value: (slab) => `${slab.days} Days`,
            }}
          />
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Production Capacity (Units/Month)"
          error={errors.productionCapacity?.message}
        >
          <Input
            type="number"
            {...register("productionCapacity")}
            placeholder="e.g. 50000"
          />
        </FormField>

        <FormField
          label="Country of Origin"
          error={errors.originCountry?.message}
          required={true}
        >
          <select
            {...register("originCountry", { required: "Required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Country</option>
            <option value="Afghanistan">Afghanistan</option>
            <option value="Albania">Albania</option>
            <option value="Algeria">Algeria</option>
            <option value="Andorra">Andorra</option>
            <option value="Angola">Angola</option>
            <option value="Argentina">Argentina</option>
            <option value="Armenia">Armenia</option>
            <option value="Australia">Australia</option>
            <option value="Austria">Austria</option>
            <option value="Azerbaijan">Azerbaijan</option>
            <option value="Bahrain">Bahrain</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Belarus">Belarus</option>
            <option value="Belgium">Belgium</option>
            <option value="Bhutan">Bhutan</option>
            <option value="Bolivia">Bolivia</option>
            <option value="Bosnia and Herzegovina">
              Bosnia and Herzegovina
            </option>
            <option value="Brazil">Brazil</option>
            <option value="Brunei">Brunei</option>
            <option value="Bulgaria">Bulgaria</option>
            <option value="Cambodia">Cambodia</option>
            <option value="Cameroon">Cameroon</option>
            <option value="Canada">Canada</option>
            <option value="Chile">Chile</option>
            <option value="China">China</option>
            <option value="Colombia">Colombia</option>
            <option value="Costa Rica">Costa Rica</option>
            <option value="Croatia">Croatia</option>
            <option value="Cuba">Cuba</option>
            <option value="Cyprus">Cyprus</option>
            <option value="Czech Republic">Czech Republic</option>
            <option value="Denmark">Denmark</option>
            <option value="Ecuador">Ecuador</option>
            <option value="Egypt">Egypt</option>
            <option value="El Salvador">El Salvador</option>
            <option value="Estonia">Estonia</option>
            <option value="Ethiopia">Ethiopia</option>
            <option value="Finland">Finland</option>
            <option value="France">France</option>
            <option value="Georgia">Georgia</option>
            <option value="Germany">Germany</option>
            <option value="Ghana">Ghana</option>
            <option value="Greece">Greece</option>
            <option value="Guatemala">Guatemala</option>
            <option value="Honduras">Honduras</option>
            <option value="Hong Kong">Hong Kong</option>
            <option value="Hungary">Hungary</option>
            <option value="Iceland">Iceland</option>
            <option value="India">India</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Iran">Iran</option>
            <option value="Iraq">Iraq</option>
            <option value="Ireland">Ireland</option>
            <option value="Israel">Israel</option>
            <option value="Italy">Italy</option>
            <option value="Japan">Japan</option>
            <option value="Jordan">Jordan</option>
            <option value="Kazakhstan">Kazakhstan</option>
            <option value="Kenya">Kenya</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Laos">Laos</option>
            <option value="Latvia">Latvia</option>
            <option value="Lebanon">Lebanon</option>
            <option value="Libya">Libya</option>
            <option value="Lithuania">Lithuania</option>
            <option value="Luxembourg">Luxembourg</option>
            <option value="Macau">Macau</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Maldives">Maldives</option>
            <option value="Malta">Malta</option>
            <option value="Mexico">Mexico</option>
            <option value="Moldova">Moldova</option>
            <option value="Monaco">Monaco</option>
            <option value="Mongolia">Mongolia</option>
            <option value="Morocco">Morocco</option>
            <option value="Myanmar">Myanmar</option>
            <option value="Nepal">Nepal</option>
            <option value="Netherlands">Netherlands</option>
            <option value="New Zealand">New Zealand</option>
            <option value="Nigeria">Nigeria</option>
            <option value="North Korea">North Korea</option>
            <option value="Norway">Norway</option>
            <option value="Oman">Oman</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Panama">Panama</option>
            <option value="Paraguay">Paraguay</option>
            <option value="Peru">Peru</option>
            <option value="Philippines">Philippines</option>
            <option value="Poland">Poland</option>
            <option value="Portugal">Portugal</option>
            <option value="Qatar">Qatar</option>
            <option value="Romania">Romania</option>
            <option value="Russia">Russia</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Serbia">Serbia</option>
            <option value="Singapore">Singapore</option>
            <option value="Slovakia">Slovakia</option>
            <option value="Slovenia">Slovenia</option>
            <option value="South Africa">South Africa</option>
            <option value="South Korea">South Korea</option>
            <option value="Spain">Spain</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="Sweden">Sweden</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Syria">Syria</option>
            <option value="Taiwan">Taiwan</option>
            <option value="Tanzania">Tanzania</option>
            <option value="Thailand">Thailand</option>
            <option value="Tunisia">Tunisia</option>
            <option value="Turkey">Turkey</option>
            <option value="UAE">UAE</option>
            <option value="Uganda">Uganda</option>
            <option value="Ukraine">Ukraine</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United States">United States</option>
            <option value="Uruguay">Uruguay</option>
            <option value="Uzbekistan">Uzbekistan</option>
            <option value="Venezuela">Venezuela</option>
            <option value="Vietnam">Vietnam</option>
            <option value="Yemen">Yemen</option>
            <option value="Zimbabwe">Zimbabwe</option>
          </select>
        </FormField>
      </div>

      <FormField
        label="Packaging Description"
        error={errors.packagingDetails?.message}
      >
        <Textarea
          {...register("packagingDetails")}
          placeholder="e.g. Corrugated box with bubble wrap"
        />
      </FormField>
    </div>
  );
}

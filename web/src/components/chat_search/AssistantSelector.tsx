import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAssistants } from "@/components/context/AssistantsContext";
import { useChatContext } from "@/components/context/ChatContext";
import { useUser } from "@/components/user/UserProvider";
import { Persona } from "@/app/admin/assistants/interfaces";
import { LLMProviderDescriptor } from "@/app/admin/configuration/llm/interfaces";
import { FiChevronDown } from "react-icons/fi";
import { getFinalLLM, destructureValue } from "@/lib/llm/utils";
import { updateModelOverrideForChatSession } from "@/app/chat/lib";
import { debounce } from "lodash";
import { LlmList } from "@/components/llm/LLMList";
import { checkPersonaRequiresImageGeneration } from "@/app/admin/assistants/lib";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableAssistantCard } from "@/components/assistants/AssistantCards";
import { updateUserAssistantList } from "@/lib/assistants/updateAssistantPreferences";
import Text from "@/components/ui/text";
import { GearIcon } from "@/components/icons/icons";
import { LlmOverrideManager } from "@/lib/hooks";
import { Tab } from "@headlessui/react";
import { AssistantIcon } from "../assistants/AssistantIcon";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { restrictToParentElement } from "@dnd-kit/modifiers";

const AssistantSelector = ({
  liveAssistant,
  onAssistantChange,
  chatSessionId,
  llmOverrideManager,
}: {
  liveAssistant: Persona;
  onAssistantChange: (assistant: Persona) => void;
  chatSessionId?: string;
  llmOverrideManager?: LlmOverrideManager;
}) => {
  const { finalAssistants, refreshAssistants } = useAssistants();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { llmProviders } = useChatContext();
  const { refreshUser, user } = useUser();
  const [assistants, setAssistants] = useState<Persona[]>(finalAssistants);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isTemperatureExpanded, setIsTemperatureExpanded] = useState(false);
  const [localTemperature, setLocalTemperature] = useState<number>(
    llmOverrideManager?.temperature || 0
  );

  useEffect(() => {
    setAssistants(finalAssistants);
  }, [finalAssistants]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = assistants.findIndex(
        (item) => item.id.toString() === active.id
      );
      const newIndex = assistants.findIndex(
        (item) => item.id.toString() === over.id
      );
      const updatedAssistants = arrayMove(assistants, oldIndex, newIndex);
      setAssistants(updatedAssistants);
      await updateUserAssistantList(updatedAssistants.map((a) => a.id));
    }
  };

  const debouncedSetTemperature = useCallback(
    (value: number) => {
      const debouncedFunction = debounce((value: number) => {
        llmOverrideManager?.setTemperature(value);
      }, 300);
      return debouncedFunction(value);
    },
    [llmOverrideManager]
  );

  const handleTemperatureChange = (value: number) => {
    setLocalTemperature(value);
    debouncedSetTemperature(value);
  };

  // Get the user's default model
  const userDefaultModel = user?.preferences.default_model;

  // Get the assistant's default model if it exists
  const assistantDefaultModel = liveAssistant.llm_model_version_override;

  // Determine the current LLM model to use
  const currentLlm =
    llmOverrideManager?.llmOverride?.modelName ??
    assistantDefaultModel ??
    userDefaultModel ??
    llmProviders[0].model_names[0];

  const requiresImageGeneration =
    checkPersonaRequiresImageGeneration(liveAssistant);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex justify-center">
        <div
          onClick={() => {
            setIsOpen(!isOpen);
            setSelectedTab(0);
          }}
          className="flex items-center gap-x-2 justify-between px-6 py-3 text-sm font-medium text-white bg-black rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          <div className="flex gap-x-2 items-center">
            <AssistantIcon assistant={liveAssistant} size="xs" />
            <span className="font-bold">{liveAssistant.name}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-xs">{currentLlm}</span>
            <FiChevronDown
              className={`w-5 h-5 text-white transition-transform duration-300 transform ${
                isOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-96 mt-2 origin-top-center left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex p-1 space-x-1 bg-gray-100 rounded-t-md">
              <Tab
                className={({ selected }) =>
                  `w-full py-2.5 text-sm leading-5 font-medium rounded-md
                   ${
                     selected
                       ? "bg-white text-gray-700 shadow"
                       : "text-gray-500 hover:bg-white/[0.12] hover:text-gray-700"
                   }`
                }
              >
                Assistant
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full py-2.5 text-sm leading-5 font-medium rounded-md
                   ${
                     selected
                       ? "bg-white text-gray-700 shadow"
                       : "text-gray-500 hover:bg-white/[0.12] hover:text-gray-700"
                   }`
                }
              >
                Model
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel className="p-3">
                <div className="mb-4">
                  <h3 className="text-center text-lg font-semibold text-gray-800">
                    Choose an Assistant
                  </h3>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext
                    items={assistants.map((a) => a.id.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {assistants.map((assistant) => (
                        <DraggableAssistantCard
                          key={assistant.id.toString()}
                          assistant={assistant}
                          isSelected={liveAssistant.id === assistant.id}
                          onSelect={(assistant) => {
                            onAssistantChange(assistant);
                            setIsOpen(false);
                          }}
                          llmName={
                            assistant.llm_model_version_override ??
                            userDefaultModel ??
                            currentLlm
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </Tab.Panel>
              <Tab.Panel className="p-3">
                <div className="mb-4">
                  <h3 className="text-center text-lg font-semibold text-gray-800 ">
                    Choose a Model
                  </h3>
                </div>
                <LlmList
                  currentAssistant={liveAssistant}
                  requiresImageGeneration={requiresImageGeneration}
                  llmProviders={llmProviders}
                  currentLlm={currentLlm}
                  userDefault={userDefaultModel}
                  includeUserDefault={true}
                  onSelect={(value: string | null) => {
                    if (value == null) return;
                    const { modelName, name, provider } =
                      destructureValue(value);
                    llmOverrideManager?.setLlmOverride({
                      name,
                      provider,
                      modelName,
                    });
                    if (chatSessionId) {
                      updateModelOverrideForChatSession(chatSessionId, value);
                    }
                    setIsOpen(false);
                  }}
                />
                <div className="mt-4">
                  <button
                    className="flex items-center text-sm font-medium transition-colors duration-200"
                    onClick={() =>
                      setIsTemperatureExpanded(!isTemperatureExpanded)
                    }
                  >
                    <span className="mr-2 text-xs text-primary">
                      {isTemperatureExpanded ? "▼" : "►"}
                    </span>
                    <span>Temperature</span>
                  </button>

                  {isTemperatureExpanded && (
                    <>
                      <Text className="mt-2 mb-8">
                        Adjust the temperature of the LLM. Higher temperatures
                        will make the LLM generate more creative and diverse
                        responses, while lower temperature will make the LLM
                        generate more conservative and focused responses.
                      </Text>

                      <div className="relative w-full">
                        <input
                          type="range"
                          onChange={(e) =>
                            handleTemperatureChange(parseFloat(e.target.value))
                          }
                          className="w-full p-2 border border-border rounded-md"
                          min="0"
                          max="2"
                          step="0.01"
                          value={localTemperature}
                        />
                        <div
                          className="absolute text-sm"
                          style={{
                            left: `${(localTemperature || 0) * 50}%`,
                            transform: `translateX(-${Math.min(
                              Math.max((localTemperature || 0) * 50, 10),
                              90
                            )}%)`,
                            top: "-1.5rem",
                          }}
                        >
                          {localTemperature}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  );
};

export default AssistantSelector;

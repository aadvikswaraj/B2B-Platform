import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { MoreVertical, Star, User, BellOff, Trash2 } from "lucide-react";
import Image from "next/image";

import { getAvatarColor } from "@/utils/avatarColor";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ConversationItem({
  contact,
  isActive,
  onClick,
  onAction,
  mode = "buyer",
}) {
  const displayName =
    mode === "buyer"
      ? contact.companyName || contact.name || "Unknown User"
      : contact.name || contact.companyName || "Unknown User";

  const avatarText = displayName[0]?.toUpperCase() || "?";
  const avatarBg = getAvatarColor(displayName);
  const avatarSrc = contact.avatar || contact.logo;

  return (
    <div
      className={`group relative flex items-center p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isActive ? "bg-blue-50 hover:bg-blue-50" : ""}`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-lg ${!avatarSrc ? avatarBg : "bg-gray-200"}`}
        >
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={displayName}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{avatarText}</span>
          )}
        </div>
        {contact.online && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400" />
        )}
      </div>

      {/* Content */}
      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3
            className={`text-sm font-semibold truncate ${isActive ? "text-blue-900" : "text-gray-900"}`}
          >
            {displayName}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {contact.updatedAt
              ? new Date(contact.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p
            className={`text-xs sm:text-sm truncate ${contact.unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-500"}`}
          >
            {typeof contact.lastMessage === "object"
              ? contact.lastMessage?.content || "Attachment"
              : contact.lastMessage || contact.notes || "No messages"}
          </p>
          <div className="flex items-center space-x-1 ml-2">
            {contact.starred && (
              <Star size={12} className="text-yellow-500 fill-current" />
            )}
            {contact.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full min-w-[1.25rem]">
                {contact.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover action menu - visible on hover or if menu open. On mobile always visible but subtle */}
      <div className="ml-2" onClick={(e) => e.stopPropagation()}>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <span className="sr-only">Open options</span>
              <MoreVertical size={16} />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onAction("info", contact)}
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm w-full",
                      )}
                    >
                      <User
                        className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Contact Info
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onAction("star", contact)}
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm w-full",
                      )}
                    >
                      <Star
                        className={`mr-3 h-4 w-4 ${contact.starred ? "text-yellow-400 fill-current" : "text-gray-400 group-hover:text-gray-500"}`}
                        aria-hidden="true"
                      />
                      {contact.starred ? "Unstar" : "Star Contact"}
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onAction("mute", contact)}
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm w-full",
                      )}
                    >
                      <BellOff
                        className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Mute Notifications
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onAction("delete", contact)}
                      className={classNames(
                        active ? "bg-gray-100 text-red-900" : "text-red-700",
                        "group flex items-center px-4 py-2 text-sm w-full",
                      )}
                    >
                      <Trash2
                        className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500"
                        aria-hidden="true"
                      />
                      Delete Chat
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}

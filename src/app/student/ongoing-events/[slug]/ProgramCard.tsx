import Image from "next/image";
import { Program } from "@/Types";
import { IconCalendar, IconUsers, IconCheck } from "@tabler/icons-react";
import formatDate from "@/helper/FormatDate";
import Link from "next/link";

export default function ProgramCard({ program }: { program: Program }) {
  return (
    <div className="card bg-base-300/60 shadow-md hover:shadow-xl transition-all duration-200 border border-accent">
      <figure className="relative h-40 w-full overflow-hidden rounded-t-xl">
        <Image
          src={program.coverImage || "/placeholder.jpg"}
          alt={program.title}
          fill
          className="object-contain bg-base-300/20 backdrop-blur-lg"
        />
      </figure>

      <div className="card-body bg-base-300/10">
        <h3 className="card-title text-lg font-semibold text-base-content">
          {program.title}
        </h3>
        <hr />

        <p className="text-sm text-base-content/70 line-clamp-3">
          {program.description || "No description available."}
        </p>

        <div className="flex flex-col gap-6 items-center justify-between text-xs text-base-content/70 mt-3">
          <div className="flex items-center gap-1 justify-center">
            <IconCalendar size={14} />
            <span className="whitespace-nowrap text-base">
              {program.registrationStart
                ? formatDate(program.registrationStart)
                : "N/A"}
              {" → "}
              {program.registrationEnd
                ? formatDate(program.registrationEnd)
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-1 justify-center text-base">
            <IconUsers size={14} />
            <span>{program.totalParticipants ?? 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Link
            href={`/student/ongoing-events/program/${program.slug}`}
            className="btn btn-sm btn-outline btn-secondary"
          >
            Read More
          </Link>
          {program.isRegistered ? (
            <div
              className="btn btn-sm btn-success text-white bg-emerald-600 border-none flex items-center justify-center gap-1 cursor-default opacity-100"
            >
              <IconCheck size={14} className="text-white" /> Registered
            </div>
          ) : (
            <Link
              href={`/student/ongoing-events/program/${program.slug}`}
              className="btn btn-sm btn-primary"
            >
              Participate
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';
import { useParams } from "next/navigation";


export default function id() {
    const { id } = useParams();
    return (
        <div>
            <h1>Ini halaman kelas {id}</h1>
        </div>
    )
}